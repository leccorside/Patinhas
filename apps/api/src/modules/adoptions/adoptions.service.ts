import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
  CreateAdoptionApplicationDto,
} from './dto/create-application.dto';
import { UpdateAdoptionStatusDto } from './dto/update-application-status.dto';
import { ScheduleInterviewDto, CompleteAdoptionDto } from './dto/schedule-interview.dto';
import {
  AdoptionApplicationStatus,
  AnimalStatus,
} from '@prisma/client';

@Injectable()
export class AdoptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Submeter uma nova candidatura de adoção com questionário de elegibilidade
   */
  async apply(userId: string, dto: CreateAdoptionApplicationDto) {
    const animal = await this.prisma.animal.findUnique({
      where: { id: dto.animalId },
      include: {
        organization: true,
        protector: true,
      },
    });

    if (!animal) {
      throw new NotFoundException('Animal não encontrado.');
    }

    if (animal.status === AnimalStatus.ADOPTED) {
      throw new BadRequestException('Este pet já encontrou um lar definitivo e foi adotado.');
    }

    if (animal.status === AnimalStatus.UNAVAILABLE || animal.status === AnimalStatus.ARCHIVED || animal.status === AnimalStatus.DRAFT) {
      throw new BadRequestException('Este pet não está disponível para adoção no momento.');
    }

    if (animal.protectorId && animal.protectorId === userId) {
      throw new BadRequestException('Você não pode submeter uma candidatura para o animal que você mesmo cadastrou.');
    }

    // Verificar se já existe candidatura ativa do mesmo adotante para este pet
    const activeExisting = await this.prisma.adoptionApplication.findFirst({
      where: {
        animalId: dto.animalId,
        adopterId: userId,
        currentStatus: {
          in: [
            AdoptionApplicationStatus.SUBMITTED,
            AdoptionApplicationStatus.UNDER_REVIEW,
            AdoptionApplicationStatus.INTERVIEW_SCHEDULED,
            AdoptionApplicationStatus.APPROVED,
          ],
        },
      },
    });

    if (activeExisting) {
      throw new BadRequestException(
        'Você já possui uma candidatura em andamento para este pet. Acompanhe em "Minhas Solicitações".',
      );
    }

    // Transação para criar candidatura, questionário, respostas e histórico inicial
    const result = await this.prisma.$transaction(async (tx) => {
      const application = await tx.adoptionApplication.create({
        data: {
          animalId: dto.animalId,
          adopterId: userId,
          currentStatus: AdoptionApplicationStatus.SUBMITTED,
          questionnaire: {
            create: {
              housingType: dto.questionnaire.housingType,
              isRented: dto.questionnaire.isRented ?? false,
              hasOutdoorSpace: dto.questionnaire.hasOutdoorSpace ?? false,
              hasNettingScreens: dto.questionnaire.hasNettingScreens ?? false,
              familyAgreement: dto.questionnaire.familyAgreement ?? true,
              householdPeopleCount: dto.questionnaire.householdPeopleCount ?? 1,
              hasOtherPets: dto.questionnaire.hasOtherPets ?? false,
              otherPetsDetails: dto.questionnaire.otherPetsDetails,
              monthlyBudgetBrl: dto.questionnaire.monthlyBudgetBrl,
              routineHoursAlone: dto.questionnaire.routineHoursAlone,
              adopterExperience: dto.questionnaire.adopterExperience,
              answers: dto.questionnaire.answers && dto.questionnaire.answers.length > 0
                ? {
                    create: dto.questionnaire.answers.map((ans) => ({
                      questionKey: ans.questionKey,
                      questionText: ans.questionText,
                      answerValue: ans.answerValue,
                    })),
                  }
                : undefined,
            },
          },
          statusHistory: {
            create: {
              changedByUserId: userId,
              previousStatus: AdoptionApplicationStatus.SUBMITTED,
              newStatus: AdoptionApplicationStatus.SUBMITTED,
              observation: 'Candidatura e questionário de triagem submetidos com sucesso pelo adotante.',
            },
          },
        },
        include: {
          animal: {
            include: {
              photos: { orderBy: { isCover: 'desc' } },
              organization: true,
            },
          },
          questionnaire: {
            include: { answers: true },
          },
          statusHistory: true,
        },
      });

      return application;
    });

    return {
      success: true,
      message: `Solicitação de adoção para ${animal.name} enviada com sucesso! 🐾`,
      application: result,
    };
  }

  /**
   * Listar candidaturas do adotante autenticado
   */
  async findMyApplications(userId: string) {
    return this.prisma.adoptionApplication.findMany({
      where: { adopterId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        animal: {
          include: {
            photos: { orderBy: { isCover: 'desc' } },
            organization: true,
            protector: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
        questionnaire: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          include: {
            changedByUser: {
              select: {
                id: true,
                role: true,
                profile: { select: { fullName: true, avatarUrl: true } },
              },
            },
          },
        },
        adoption: true,
      },
    });
  }

  /**
   * Listar candidaturas recebidas pela ONG ou Protetor
   */
  async findReceivedApplications(userId: string) {
    // Busca ONGs das quais o usuário é membro
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      select: { organizationId: true },
    });
    const orgIds = memberships.map((m) => m.organizationId);

    return this.prisma.adoptionApplication.findMany({
      where: {
        OR: [
          { animal: { protectorId: userId } },
          { animal: { organizationId: { in: orgIds } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        adopter: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        animal: {
          include: {
            photos: { orderBy: { isCover: 'desc' } },
            organization: true,
          },
        },
        questionnaire: {
          include: { answers: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Obter detalhes de uma candidatura
   */
  async findOne(id: string, userId: string) {
    const app = await this.prisma.adoptionApplication.findUnique({
      where: { id },
      include: {
        adopter: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        animal: {
          include: {
            photos: { orderBy: { isCover: 'desc' } },
            organization: true,
            protector: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
            healthRecord: true,
            traits: true,
          },
        },
        questionnaire: {
          include: { answers: true },
        },
        statusHistory: {
          orderBy: { createdAt: 'asc' },
          include: {
            changedByUser: {
              select: {
                id: true,
                profile: { select: { fullName: true } },
              },
            },
          },
        },
        adoption: true,
      },
    });

    if (!app) {
      throw new NotFoundException('Candidatura não encontrada.');
    }

    // Permissão: apenas o adotante, o protetor ou membros da organização do animal podem ver
    const isAdopter = app.adopterId === userId;
    const isProtector = app.animal.protectorId === userId;
    let isOrgMember = false;

    if (app.animal.organizationId) {
      const member = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: app.animal.organizationId,
            userId,
          },
        },
      });
      if (member) isOrgMember = true;
    }

    if (!isAdopter && !isProtector && !isOrgMember) {
      throw new ForbiddenException('Você não tem permissão para visualizar esta candidatura.');
    }

    return app;
  }

  /**
   * Atualizar status da candidatura (máquina de estados)
   */
  async updateStatus(id: string, userId: string, dto: UpdateAdoptionStatusDto) {
    const app = await this.prisma.adoptionApplication.findUnique({
      where: { id },
      include: {
        animal: true,
      },
    });

    if (!app) {
      throw new NotFoundException('Candidatura não encontrada.');
    }

    // Verificar se o usuário é o protetor ou membro da ONG
    await this.assertCanManageApplication(app.animal, userId);

    const oldStatus = app.currentStatus;
    const newStatus = dto.status;

    // Validação estrita de transição de status
    this.validateStatusTransition(oldStatus, newStatus);

    const updated = await this.prisma.$transaction(async (tx) => {
      // Se aprovado, pode mudar o status do animal para IN_ADOPTION
      if (newStatus === AdoptionApplicationStatus.APPROVED) {
        await tx.animal.update({
          where: { id: app.animalId },
          data: { status: AnimalStatus.IN_ADOPTION },
        });
      }

      const res = await tx.adoptionApplication.update({
        where: { id },
        data: {
          currentStatus: newStatus,
          rejectionReason: newStatus === AdoptionApplicationStatus.REJECTED ? dto.rejectionReason : null,
        },
      });

      await tx.adoptionStatusHistory.create({
        data: {
          applicationId: id,
          changedByUserId: userId,
          previousStatus: oldStatus,
          newStatus,
          observation: dto.observation || `Status alterado de ${oldStatus} para ${newStatus}`,
        },
      });

      return res;
    });

    return {
      success: true,
      message: `Status da candidatura atualizado para ${newStatus}.`,
      application: updated,
    };
  }

  /**
   * Agendar entrevista com o candidato
   */
  async scheduleInterview(id: string, userId: string, dto: ScheduleInterviewDto) {
    const app = await this.prisma.adoptionApplication.findUnique({
      where: { id },
      include: { animal: true },
    });

    if (!app) {
      throw new NotFoundException('Candidatura não encontrada.');
    }

    await this.assertCanManageApplication(app.animal, userId);

    const interviewDate = new Date(dto.interviewDate);
    const oldStatus = app.currentStatus;

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.adoptionApplication.update({
        where: { id },
        data: {
          currentStatus: AdoptionApplicationStatus.INTERVIEW_SCHEDULED,
          interviewDate,
        },
      });

      await tx.adoptionStatusHistory.create({
        data: {
          applicationId: id,
          changedByUserId: userId,
          previousStatus: oldStatus,
          newStatus: AdoptionApplicationStatus.INTERVIEW_SCHEDULED,
          observation: dto.observation || `Entrevista agendada para ${interviewDate.toLocaleString('pt-BR')}.`,
        },
      });

      return res;
    });

    return {
      success: true,
      message: 'Entrevista agendada com sucesso!',
      application: updated,
    };
  }

  /**
   * Conclusão atômica de adoção com trava de concorrência e finalização de outras candidaturas
   */
  async completeAdoption(id: string, userId: string, dto: CompleteAdoptionDto) {
    const app = await this.prisma.adoptionApplication.findUnique({
      where: { id },
      include: {
        animal: true,
        adopter: { select: { id: true, email: true, profile: true } },
      },
    });

    if (!app) {
      throw new NotFoundException('Candidatura não encontrada.');
    }

    await this.assertCanManageApplication(app.animal, userId);

    if (app.currentStatus === AdoptionApplicationStatus.COMPLETED) {
      throw new BadRequestException('Esta adoção já foi concluída anteriormente.');
    }

    // Execução atômica no banco de dados
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Marcar a candidatura vencedora como COMPLETED
      const completedApp = await tx.adoptionApplication.update({
        where: { id },
        data: {
          currentStatus: AdoptionApplicationStatus.COMPLETED,
        },
      });

      // 2. Marcar o Animal como ADOPTED
      await tx.animal.update({
        where: { id: app.animalId },
        data: {
          status: AnimalStatus.ADOPTED,
        },
      });

      // 3. Criar registro oficial de Adoção
      const adoption = await tx.adoption.create({
        data: {
          animalId: app.animalId,
          applicationId: app.id,
          adopterId: app.adopterId,
          completedAt: new Date(),
          adoptionTermsSigned: true,
          termsDocumentUrl: dto.termsDocumentUrl,
          notes: dto.notes,
        },
      });

      // 4. Histórico da candidatura concluída
      await tx.adoptionStatusHistory.create({
        data: {
          applicationId: id,
          changedByUserId: userId,
          previousStatus: app.currentStatus,
          newStatus: AdoptionApplicationStatus.COMPLETED,
          observation: dto.notes || 'Adoção formalizada e concluída com sucesso! Lar definitivo conquistado. 🎉',
        },
      });

      // 5. Cancelar outras candidaturas concorrentes para o mesmo animal com elegância
      const concurrentApps = await tx.adoptionApplication.findMany({
        where: {
          animalId: app.animalId,
          id: { not: id },
          currentStatus: {
            in: [
              AdoptionApplicationStatus.SUBMITTED,
              AdoptionApplicationStatus.UNDER_REVIEW,
              AdoptionApplicationStatus.INTERVIEW_SCHEDULED,
              AdoptionApplicationStatus.APPROVED,
            ],
          },
        },
      });

      for (const concurrent of concurrentApps) {
        await tx.adoptionApplication.update({
          where: { id: concurrent.id },
          data: {
            currentStatus: AdoptionApplicationStatus.CANCELLED,
            rejectionReason: 'Este pet foi acolhido por outra família. Mas não desanime, temos outros amiguinhos esperando por você!',
          },
        });

        await tx.adoptionStatusHistory.create({
          data: {
            applicationId: concurrent.id,
            changedByUserId: userId,
            previousStatus: concurrent.currentStatus,
            newStatus: AdoptionApplicationStatus.CANCELLED,
            observation: 'Processo encerrado automaticamente devido à adoção concluída por outro candidato.',
          },
        });
      }

      return {
        completedApp,
        adoption,
        cancelledCount: concurrentApps.length,
      };
    });

    return {
      success: true,
      message: `Parabéns! Adoção de ${app.animal.name} concluída com sucesso! 🎉`,
      adoption: result.adoption,
      cancelledConcurrentApplications: result.cancelledCount,
    };
  }

  /**
   * Cancelar candidatura pelo próprio adotante
   */
  async cancelByAdopter(id: string, userId: string, reason?: string) {
    const app = await this.prisma.adoptionApplication.findUnique({
      where: { id },
      include: { animal: true },
    });

    if (!app) {
      throw new NotFoundException('Candidatura não encontrada.');
    }

    if (app.adopterId !== userId) {
      throw new ForbiddenException('Apenas o solicitante pode desistir da candidatura.');
    }

    if (app.currentStatus === AdoptionApplicationStatus.COMPLETED) {
      throw new BadRequestException('Não é possível cancelar uma adoção já finalizada.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const res = await tx.adoptionApplication.update({
        where: { id },
        data: {
          currentStatus: AdoptionApplicationStatus.CANCELLED,
          rejectionReason: reason || 'Cancelado pelo solicitante.',
        },
      });

      await tx.adoptionStatusHistory.create({
        data: {
          applicationId: id,
          changedByUserId: userId,
          previousStatus: app.currentStatus,
          newStatus: AdoptionApplicationStatus.CANCELLED,
          observation: reason || 'O solicitante cancelou a candidatura.',
        },
      });

      return res;
    });

    return {
      success: true,
      message: 'Candidatura cancelada com sucesso.',
      application: updated,
    };
  }

  // ==============================================================================
  // HELPERS DE PERMISSÃO E TRANSIÇÃO
  // ==============================================================================

  private async assertCanManageApplication(animal: { protectorId: string | null; organizationId: string | null }, userId: string) {
    if (animal.protectorId && animal.protectorId === userId) {
      return true;
    }

    if (animal.organizationId) {
      const member = await this.prisma.organizationMember.findUnique({
        where: {
          organizationId_userId: {
            organizationId: animal.organizationId,
            userId,
          },
        },
      });
      if (member) return true;
    }

    throw new ForbiddenException('Você não tem permissão para gerenciar as candidaturas deste pet.');
  }

  private validateStatusTransition(current: AdoptionApplicationStatus, next: AdoptionApplicationStatus) {
    const allowedTransitions: Record<AdoptionApplicationStatus, AdoptionApplicationStatus[]> = {
      SUBMITTED: [
        AdoptionApplicationStatus.UNDER_REVIEW,
        AdoptionApplicationStatus.REJECTED,
        AdoptionApplicationStatus.CANCELLED,
      ],
      UNDER_REVIEW: [
        AdoptionApplicationStatus.INTERVIEW_SCHEDULED,
        AdoptionApplicationStatus.APPROVED,
        AdoptionApplicationStatus.REJECTED,
        AdoptionApplicationStatus.CANCELLED,
      ],
      INTERVIEW_SCHEDULED: [
        AdoptionApplicationStatus.APPROVED,
        AdoptionApplicationStatus.UNDER_REVIEW,
        AdoptionApplicationStatus.REJECTED,
        AdoptionApplicationStatus.CANCELLED,
      ],
      APPROVED: [
        AdoptionApplicationStatus.COMPLETED,
        AdoptionApplicationStatus.CANCELLED,
        AdoptionApplicationStatus.REJECTED,
      ],
      REJECTED: [],
      CANCELLED: [],
      COMPLETED: [],
    };

    const allowed = allowedTransitions[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException(
        `Transição de status inválida: não é permitido transicionar de ${current} para ${next}.`,
      );
    }
  }
}
