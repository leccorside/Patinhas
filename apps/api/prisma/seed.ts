import { PrismaClient, UserRole, UserStatus, AnimalSpecies, AnimalSex, AnimalSize, AnimalAgeUnit, EnergyLevel, AnimalStatus, OrganizationVerificationStatus, OrganizationMemberRole } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🐾 Iniciando seed da base de dados Patinhas...');

  // Senha padrão para todos os usuários de teste
  const passwordHash = await argon2.hash('Patinhas@2026', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // Limpeza prévia segura em ordem reversa
  await prisma.animalTrait.deleteMany();
  await prisma.animalHealthRecord.deleteMany();
  await prisma.animalPhoto.deleteMany();
  await prisma.animalVideo.deleteMany();
  await prisma.animal.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();
  await prisma.educationalArticle.deleteMany();

  console.log('🧹 Tabelas limpas com sucesso.');

  // 1. CONFIGURAÇÕES DO SISTEMA
  await prisma.systemSetting.createMany({
    data: [
      { key: 'APP_VERSION', value: '1.0.0', description: 'Versão atual do aplicativo mobile' },
      { key: 'MAX_IMAGES_PER_PET', value: '6', description: 'Número máximo de fotos por animal' },
      { key: 'DEFAULT_SEARCH_RADIUS_KM', value: '25', description: 'Raio padrão de busca em quilômetros' },
      { key: 'MAINTENANCE_MODE', value: 'false', description: 'Indica se a plataforma está em manutenção' },
    ],
  });

  // 2. ARTIGOS EDUCATIVOS
  await prisma.educationalArticle.createMany({
    data: [
      {
        title: 'Adaptação do Pet nos Primeiros 15 Dias',
        slug: 'adaptacao-do-pet-primeiros-15-dias',
        summary: 'Dicas essenciais para receber seu novo companheiro com tranquilidade e afeto.',
        category: 'Adaptação',
        readTimeMin: 4,
        content: 'Os primeiros dias em um novo lar são repletos de novidades para o animal. Crie um espaço seguro, mantenha uma rotina previsível de alimentação e evite visitas excessivas nas primeiras 48 horas.',
        coverUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      },
      {
        title: 'Guia Completo de Vacinação e Cuidados Preventivos',
        slug: 'guia-vacinacao-cuidados-preventivos',
        summary: 'Saiba quais são as vacinas obrigatórias (V8/V10 para cães e V4/V5 para gatos) e o protocolo antirrábico.',
        category: 'Saúde',
        readTimeMin: 5,
        content: 'A vacinação anual é um ato de amor e responsabilidade. Proteja seu pet contra cinomose, parvovirose, raiva e leucemia felina.',
        coverUrl: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=800&q=80',
      },
    ],
  });

  // 3. USUÁRIO MASTER ADMIN
  const masterAdmin = await prisma.user.create({
    data: {
      email: 'admin@patinhas.org',
      passwordHash,
      role: UserRole.MASTER_ADMIN,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: 'Administrador Master Patinhas',
          phone: '(11) 99999-0001',
          addressCity: 'São Paulo',
          addressState: 'SP',
          latitude: -23.5505,
          longitude: -46.6333,
        },
      },
    },
  });

  // 4. ONG: INSTITUTO PATINHAS DE LUZ
  const shelterOwner = await prisma.user.create({
    data: {
      email: 'contato@patinhasdeluz.org',
      passwordHash,
      role: UserRole.SHELTER_MEMBER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: 'Coordenação Patinhas de Luz',
          phone: '(11) 98888-1111',
          addressCity: 'São Paulo',
          addressState: 'SP',
          latitude: -23.5505,
          longitude: -46.6333,
        },
      },
    },
  });

  const organization = await prisma.organization.create({
    data: {
      name: 'Instituto Patinhas de Luz',
      tradeName: 'Patinhas de Luz Resgates',
      cnpj: '12.345.678/0001-90',
      email: 'contato@patinhasdeluz.org',
      phone: '(11) 3214-5500',
      whatsapp: '(11) 98888-1111',
      bio: 'Dedicados ao resgate, reabilitação e acolhimento de animais abandonados desde 2018.',
      verifiedStatus: OrganizationVerificationStatus.VERIFIED,
      verifiedAt: new Date(),
      addressStreet: 'Rua dos Pinheiros',
      addressNumber: '1200',
      addressCity: 'São Paulo',
      addressState: 'SP',
      postalCode: '05422-001',
      latitude: -23.5615,
      longitude: -46.6853,
      logoUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
      members: {
        create: {
          userId: shelterOwner.id,
          role: OrganizationMemberRole.OWNER,
        },
      },
    },
  });

  // 5. PROTETORA INDEPENDENTE: ANA LUÍSA
  const protector = await prisma.user.create({
    data: {
      email: 'ana.protetora@gmail.com',
      passwordHash,
      role: UserRole.PROTECTOR,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: 'Ana Luísa Protetora',
          phone: '(19) 97777-2222',
          bio: 'Resgato cães e gatos em situação de vulnerabilidade na região metropolitana de Campinas.',
          addressCity: 'Campinas',
          addressState: 'SP',
          latitude: -22.9099,
          longitude: -47.0626,
        },
      },
    },
  });

  // 6. ADOTANTE: LUCAS SILVA
  const adopter = await prisma.user.create({
    data: {
      email: 'lucas.adotante@gmail.com',
      passwordHash,
      role: UserRole.ADOPTER,
      status: UserStatus.ACTIVE,
      emailVerifiedAt: new Date(),
      profile: {
        create: {
          fullName: 'Lucas Silva',
          phone: '(11) 96666-3333',
          bio: 'Amante de animais, moro em casa com quintal telado e busco um novo melhor amigo.',
          addressCity: 'São Paulo',
          addressState: 'SP',
          latitude: -23.5489,
          longitude: -46.6388,
        },
      },
    },
  });

  // 7. ANIMAIS PARA ADOÇÃO

  // Pet 1: Charlie (Referência direta de uxui/perfil_do_pet_charlie)
  const charlie = await prisma.animal.create({
    data: {
      organizationId: organization.id,
      name: 'Charlie',
      species: AnimalSpecies.DOG,
      breed: 'Golden Retriever Mestiço',
      ageApproximate: 11,
      ageUnit: AnimalAgeUnit.MONTHS,
      sex: AnimalSex.MALE,
      size: AnimalSize.MEDIUM,
      weightKg: 14.5,
      coatColor: 'Dourado / Caramelo',
      description: 'Charlie é um jovem cheio de energia e muito carinhoso. Resgatado com 3 meses, hoje está completamente saudável, vacinado e pronto para encher um lar de alegria.',
      adoptionRequirements: 'Casa ou apartamento espaçoso; disponibilidade para passeios diários; telas de proteção se em apartamento.',
      status: AnimalStatus.AVAILABLE,
      compatibilityDogs: true,
      compatibilityCats: true,
      compatibilityChildren: true,
      energyLevel: EnergyLevel.HIGH,
      city: 'São Paulo',
      state: 'SP',
      latitude: -23.5615,
      longitude: -46.6853,
      healthRecord: {
        create: {
          isVaccinated: true,
          vaccinationDetails: 'V10 completa (3 doses) e Antirrábica 2026',
          isNeutered: true,
          isDewormed: true,
          medicalNotes: 'Exames de sangue e sorologia negativos para leishmaniose e dirofilariose.',
        },
      },
      traits: {
        create: [
          { name: 'Dócil' },
          { name: 'Brincalhão' },
          { name: 'Sociável com outros cães' },
          { name: 'Adora passeios' },
        ],
      },
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=250&q=80',
            isCover: true,
            displayOrder: 1,
          },
          {
            url: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=800&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=250&q=80',
            isCover: false,
            displayOrder: 2,
          },
        ],
      },
    },
  });

  // Pet 2: Luna (Gata SRD Tricolor)
  const luna = await prisma.animal.create({
    data: {
      organizationId: organization.id,
      name: 'Luna',
      species: AnimalSpecies.CAT,
      breed: 'SRD Tricolor',
      ageApproximate: 1,
      ageUnit: AnimalAgeUnit.YEARS,
      sex: AnimalSex.FEMALE,
      size: AnimalSize.SMALL,
      weightKg: 3.8,
      coatColor: 'Tricolor (Branco, Preto e Laranja)',
      description: 'Luna é calma, ronrona ao menor toque e adora cochilar no sol. Extremamente carinhosa e educada.',
      adoptionRequirements: 'Apartamento ou casa estritamente telada sem rotas de fuga.',
      status: AnimalStatus.AVAILABLE,
      compatibilityDogs: false,
      compatibilityCats: true,
      compatibilityChildren: true,
      energyLevel: EnergyLevel.LOW,
      city: 'São Paulo',
      state: 'SP',
      latitude: -23.5615,
      longitude: -46.6853,
      healthRecord: {
        create: {
          isVaccinated: true,
          vaccinationDetails: 'V5 e Raiva em dia',
          isNeutered: true,
          isDewormed: true,
          medicalNotes: 'FIV e FeLV negativos.',
        },
      },
      traits: {
        create: [
          { name: 'Calma' },
          { name: 'Afetuosa' },
          { name: 'Gosta de colo' },
          { name: 'Ronrona bastante' },
        ],
      },
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=250&q=80',
            isCover: true,
            displayOrder: 1,
          },
        ],
      },
    },
  });

  // Pet 3: Thor (Protetora Ana Luísa - Campinas)
  const thor = await prisma.animal.create({
    data: {
      protectorId: protector.id,
      name: 'Thor',
      species: AnimalSpecies.DOG,
      breed: 'Labrador Mestiço',
      ageApproximate: 2,
      ageUnit: AnimalAgeUnit.YEARS,
      sex: AnimalSex.MALE,
      size: AnimalSize.LARGE,
      weightKg: 28.0,
      coatColor: 'Preto',
      description: 'Thor é um gigante gentil. Muito dócil com crianças e pessoas de todas as idades, adora água e brincadeiras com bola.',
      adoptionRequirements: 'Imóvel com quintal amplo e muros seguros.',
      status: AnimalStatus.AVAILABLE,
      compatibilityDogs: true,
      compatibilityCats: false,
      compatibilityChildren: true,
      energyLevel: EnergyLevel.VERY_HIGH,
      city: 'Campinas',
      state: 'SP',
      latitude: -22.9099,
      longitude: -47.0626,
      healthRecord: {
        create: {
          isVaccinated: true,
          vaccinationDetails: 'V10 e Antirrábica vigentes',
          isNeutered: true,
          isDewormed: true,
        },
      },
      traits: {
        create: [
          { name: 'Energético' },
          { name: 'Amigável' },
          { name: 'Protetor' },
          { name: 'Brincalhão' },
        ],
      },
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=250&q=80',
            isCover: true,
            displayOrder: 1,
          },
        ],
      },
    },
  });

  // Pet 4: Mel (Filhote Caramelo - São Paulo)
  const mel = await prisma.animal.create({
    data: {
      organizationId: organization.id,
      name: 'Mel',
      species: AnimalSpecies.DOG,
      breed: 'SRD Caramelo',
      ageApproximate: 6,
      ageUnit: AnimalAgeUnit.MONTHS,
      sex: AnimalSex.FEMALE,
      size: AnimalSize.SMALL,
      weightKg: 7.2,
      coatColor: 'Caramelo',
      description: 'Mel é uma filhotinha dócil, esperta e muito companheira. Aprende comandos com facilidade.',
      adoptionRequirements: 'Paciência para fase de filhote e compromisso com vacinas de reforço.',
      status: AnimalStatus.AVAILABLE,
      compatibilityDogs: true,
      compatibilityCats: true,
      compatibilityChildren: true,
      energyLevel: EnergyLevel.MODERATE,
      city: 'São Paulo',
      state: 'SP',
      latitude: -23.5505,
      longitude: -46.6333,
      healthRecord: {
        create: {
          isVaccinated: true,
          vaccinationDetails: 'Protocolo de filhote concluído',
          isNeutered: true,
          isDewormed: true,
        },
      },
      traits: {
        create: [
          { name: 'Carinhosa' },
          { name: 'Inteligente' },
          { name: 'Curiosa' },
        ],
      },
      photos: {
        create: [
          {
            url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
            thumbnailUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=250&q=80',
            isCover: true,
            displayOrder: 1,
          },
        ],
      },
    },
  });

  // 8. ATUALIZAR PONTOS GEOMÉTRICOS POSTGIS PARA TODAS AS ENTIDADES COM COORDENADAS
  await prisma.$executeRawUnsafe(`
    UPDATE user_profiles 
    SET location_geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE organizations 
    SET location_geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
  `);

  await prisma.$executeRawUnsafe(`
    UPDATE animals 
    SET location_geom = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
  `);

  console.log('🌍 Coordenadas geográficas PostGIS atualizadas com sucesso.');
  console.log('✅ Seed executado com sucesso!');
  console.log('--------------------------------------------------');
  console.log('Credenciais de teste geradas:');
  console.log('Master Admin: admin@patinhas.org / Senha: Patinhas@2026');
  console.log('ONG Líder:    contato@patinhasdeluz.org / Senha: Patinhas@2026');
  console.log('Protetora:    ana.protetora@gmail.com / Senha: Patinhas@2026');
  console.log('Adotante:     lucas.adotante@gmail.com / Senha: Patinhas@2026');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

