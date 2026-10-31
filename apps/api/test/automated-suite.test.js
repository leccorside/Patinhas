const { describe, it } = require('node:test');
const assert = require('node:assert');
const http = require('http');

function apiRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

describe('🐾 Suíte de Testes Automatizados - Plataforma Patinhas (Etapa 24)', () => {
  let masterAdminToken = null;
  let shelterToken = null;
  let adopterToken = null;
  let sampleAnimalId = null;

  // 1. AUTENTICAÇÃO E CONTROLE DE ACESSO
  describe('1. Autenticação, Senhas e Tokens JWT', () => {
    it('deve realizar login como Master Admin com credenciais válidas', async () => {
      const res = await apiRequest(
        {
          hostname: 'localhost',
          port: 3333,
          path: '/api/v1/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: 'admin@patinhas.org', password: 'Patinhas@2026' }
      );

      assert.strictEqual(res.status, 200, 'Status deve ser 200 OK');
      assert.ok(res.body.accessToken, 'Deve retornar accessToken');
      assert.strictEqual(res.body.user.role, 'MASTER_ADMIN');
      masterAdminToken = res.body.accessToken;
    });

    it('deve realizar login como Membro de ONG', async () => {
      const res = await apiRequest(
        {
          hostname: 'localhost',
          port: 3333,
          path: '/api/v1/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: 'contato@patinhasdeluz.org', password: 'Patinhas@2026' }
      );

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.accessToken);
      shelterToken = res.body.accessToken;
    });

    it('deve realizar login como Adotante', async () => {
      const res = await apiRequest(
        {
          hostname: 'localhost',
          port: 3333,
          path: '/api/v1/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: 'lucas.adotante@gmail.com', password: 'Patinhas@2026' }
      );

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.accessToken);
      adopterToken = res.body.accessToken;
    });

    it('deve rejeitar login com senha incorreta (401 Unauthorized)', async () => {
      const res = await apiRequest(
        {
          hostname: 'localhost',
          port: 3333,
          path: '/api/v1/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { email: 'admin@patinhas.org', password: 'SenhaTotalmenteInvalida' }
      );

      assert.strictEqual(res.status, 401);
    });
  });

  // 2. SEGURANÇA E MATRIZ DE AUTORIZAÇÃO (RBAC)
  describe('2. Matriz de Autorização e Proteção de Rotas (RBAC)', () => {
    it('adotante NÃO pode acessar painel Master Admin (esperado 403 Forbidden)', async () => {
      const res = await apiRequest({
        hostname: 'localhost',
        port: 3333,
        path: '/api/v1/admin/overview',
        method: 'GET',
        headers: { Authorization: `Bearer ${adopterToken}` },
      });

      assert.strictEqual(res.status, 403);
    });

    it('master admin PODE acessar painel Master Admin (esperado 200 OK)', async () => {
      const res = await apiRequest({
        hostname: 'localhost',
        port: 3333,
        path: '/api/v1/admin/overview',
        method: 'GET',
        headers: { Authorization: `Bearer ${masterAdminToken}` },
      });

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.users, 'Deve conter métricas de usuários');
      assert.ok(res.body.organizations, 'Deve conter métricas de organizações');
      assert.ok(res.body.animals, 'Deve conter métricas de animais');
    });

    it('usuário sem token NÃO pode cadastrar feiras de adoção (esperado 401 Unauthorized)', async () => {
      const res = await apiRequest(
        {
          hostname: 'localhost',
          port: 3333,
          path: '/api/v1/events',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { title: 'Evento Sem Token' }
      );

      assert.strictEqual(res.status, 401);
    });
  });

  // 3. ANIMAIS, BUSCA ESPACIAL E GEO
  describe('3. Animais e Busca Espacial', () => {
    it('deve listar animais ativos para adoção', async () => {
      const res = await apiRequest({
        hostname: 'localhost',
        port: 3333,
        path: '/api/v1/animals',
        method: 'GET',
      });

      assert.strictEqual(res.status, 200);
      const list = res.body.data || res.body;
      assert.ok(Array.isArray(list), 'Deve retornar array de animais');
      assert.ok(list.length > 0, 'Deve haver animais cadastrados pelo seed');
      sampleAnimalId = list[0].id;
    });

    it('deve buscar animais por proximidade geográfica em São Paulo', async () => {
      const res = await apiRequest({
        hostname: 'localhost',
        port: 3333,
        path: '/api/v1/animals?userLat=-23.5505&userLon=-46.6333&maxDistanceKm=50',
        method: 'GET',
      });

      assert.strictEqual(res.status, 200);
      const list = res.body.data || res.body;
      assert.ok(Array.isArray(list));
    });
  });

  // 4. ALGORITMO DETERMINÍSTICO DE MATCH INTELIGENTE
  describe('4. Algoritmo de Match Inteligente (4 Dimensões)', () => {
    it('deve calcular compatibilidade do adotante autenticado com o animal', async () => {
      assert.ok(sampleAnimalId, 'Animal deve estar disponível');
      const res = await apiRequest({
        hostname: 'localhost',
        port: 3333,
        path: `/api/v1/matching/animals/${sampleAnimalId}`,
        method: 'GET',
        headers: { Authorization: `Bearer ${adopterToken}` },
      });

      assert.strictEqual(res.status, 200);
      assert.ok(typeof res.body.overallPercentage === 'number', 'Percentual deve ser numérico');
      assert.ok(res.body.overallPercentage >= 0 && res.body.overallPercentage <= 100);
      assert.ok(Array.isArray(res.body.pillars), 'Deve conter os 4 pilares avaliados');
      assert.strictEqual(res.body.pillars.length, 4, 'Exatamente 4 pilares (25% cada)');
      assert.ok(['EXCELLENT', 'HIGH', 'MODERATE', 'LOW'].includes(res.body.level));
    });
  });

  // 5. CAMPANHAS DE DOAÇÃO E VAQUINHAS
  describe('5. Campanhas de Arrecadação e Doações PIX', () => {
    it('deve listar campanhas ativas com progresso calculado', async () => {
      const res = await apiRequest({
        hostname: 'localhost',
        port: 3333,
        path: '/api/v1/campaigns',
        method: 'GET',
      });

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body));
    });
  });

  // 6. CONTEÚDO EDUCATIVO E PÓS-ADOÇÃO
  describe('6. Conteúdo Educativo e Checklists de Adaptação', () => {
    it('deve listar artigos educativos com tempo de leitura', async () => {
      const res = await apiRequest({
        hostname: 'localhost',
        port: 3333,
        path: '/api/v1/education/articles',
        method: 'GET',
      });

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.length > 0);
      assert.ok(res.body[0].title);
      assert.ok(res.body[0].readTimeMin > 0);
    });

    it('deve retornar checklist de 15 dias com aviso legal veterinário', async () => {
      const res = await apiRequest({
        hostname: 'localhost',
        port: 3333,
        path: '/api/v1/education/post-adoption/checklist?period=15_DAYS',
        method: 'GET',
      });

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.veterinaryDisclaimer.includes('veterinário'));
      assert.ok(res.body.items.length >= 4);
    });
  });
});
