import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRole, UserStatus } from '@prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  // 1. REGISTRO DE USUÁRIO
  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Já existe uma conta cadastrada com este endereço de e-mail.');
    }

    // Hashing da senha com Argon2id
    const passwordHash = await argon2.hash(dto.password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Token criptográfico aleatório para verificação de e-mail
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        role: dto.role || UserRole.ADOPTER,
        status: UserStatus.PENDING_VERIFICATION,
        verificationToken,
        profile: {
          create: {
            fullName: dto.fullName,
            phone: dto.phone,
            addressCity: dto.city,
            addressState: dto.state,
          },
        },
      },
      include: { profile: true },
    });

    // Dispara e-mail de confirmação assincronamente via Mailpit/SMTP
    await this.mailService.sendVerificationEmail(user.email, dto.fullName, verificationToken);

    return {
      message: 'Cadastro realizado com sucesso! Verifique seu e-mail para ativar a conta.',
      userId: user.id,
      email: user.email,
      requiresEmailVerification: true,
    };
  }

  // 2. LOGIN
  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException('Esta conta está temporariamente suspensa por moderação.');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, dto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('E-mail ou senha incorretos.');
    }

    // Gera Access Token (15 min) e Refresh Token (7 dias)
    const tokens = await this.generateTokens(user.id, user.email, user.role, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        fullName: user.profile?.fullName || user.email.split('@')[0],
        avatarUrl: user.profile?.avatarUrl,
        emailVerified: Boolean(user.emailVerifiedAt),
      },
      ...tokens,
    };
  }

  // 3. REFRESH TOKEN ROTATIVO
  async refreshToken(refreshToken: string, userAgent?: string, ipAddress?: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_change_in_production_min32chars',
      });

      const session = await this.prisma.userSession.findUnique({
        where: { id: payload.sessionId },
        include: { user: { include: { profile: true } } },
      });

      if (!session || session.revokedAt || new Date() > session.expiresAt) {
        throw new UnauthorizedException('Sessão expirada ou revogada. Faça login novamente.');
      }

      // Valida o hash do refresh token armazenado
      const isValid = await argon2.verify(session.refreshTokenHash, refreshToken);
      if (!isValid) {
        // Possível ataque de roubo de token — revoga a sessão imediatamente
        await this.prisma.userSession.update({
          where: { id: session.id },
          data: { revokedAt: new Date() },
        });
        throw new UnauthorizedException('Tentativa de reutilização de token detectada.');
      }

      // Invalida a sessão anterior (Rotação estrita de token)
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });

      // Emite novo par de tokens
      const tokens = await this.generateTokens(
        session.user.id,
        session.user.email,
        session.user.role,
        userAgent,
        ipAddress,
      );

      return {
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role,
          fullName: session.user.profile?.fullName || session.user.email.split('@')[0],
        },
        ...tokens,
      };
    } catch (e) {
      throw new UnauthorizedException('Token de atualização inválido ou expirado.');
    }
  }

  // 4. LOGOUT
  async logout(sessionId?: string) {
    if (sessionId) {
      await this.prisma.userSession.updateMany({
        where: { id: sessionId },
        data: { revokedAt: new Date() },
      });
    }
    return { message: 'Sessão encerrada com sucesso.' };
  }

  // 5. CONFIRMAÇÃO DE E-MAIL
  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: { verificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Token de ativação inválido ou já utilizado.');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        verificationToken: null,
      },
    });

    return { message: 'E-mail confirmado com sucesso! Sua conta está ativada.' };
  }

  // 6. ESQUECI MINHA SENHA
  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });

    if (!user) {
      // Não revela se o e-mail existe para mitigar enumeração de contas
      return { message: 'Se o e-mail estiver cadastrado, um link de recuperação será enviado.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de validade

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires,
      },
    });

    await this.mailService.sendPasswordResetEmail(
      user.email,
      user.profile?.fullName || 'Usuário',
      resetToken,
    );

    return { message: 'Se o e-mail estiver cadastrado, um link de recuperação será enviado.' };
  }

  // 7. REDEFINIR SENHA
  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token de recuperação inválido ou expirado.');
    }

    const passwordHash = await argon2.hash(dto.newPassword, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Atualiza a senha e revoga todas as sessões anteriores por segurança
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      }),
      this.prisma.userSession.updateMany({
        where: { userId: user.id },
        data: { revokedAt: new Date() },
      }),
    ]);

    return { message: 'Senha redefinida com sucesso! Você já pode fazer login com a nova senha.' };
  }

  // GERADOR PRIVADO DE TOKENS
  private async generateTokens(
    userId: string,
    email: string,
    role: UserRole,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

    // Cria registro de sessão preliminar no banco
    const session = await this.prisma.userSession.create({
      data: {
        userId,
        refreshTokenHash: 'pending',
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    const accessToken = this.jwtService.sign(
      { sub: userId, email, role, sessionId: session.id },
      {
        secret: process.env.JWT_SECRET || 'super_secret_jwt_access_key_change_in_production_min32chars',
        expiresIn: '15m',
      },
    );

    const refreshToken = this.jwtService.sign(
      { sub: userId, sessionId: session.id },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'super_secret_jwt_refresh_key_change_in_production_min32chars',
        expiresIn: '7d',
      },
    );

    // Salva hash do refresh token na sessão
    const refreshTokenHash = await argon2.hash(refreshToken);
    await this.prisma.userSession.update({
      where: { id: session.id },
      data: { refreshTokenHash },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutos em segundos
    };
  }
}

