import { storage } from './storage';

export async function seedGamificationData() {
  console.log('🎮 Seeding gamification data...');

  try {
    // Sample achievements
    const achievementsData = [
      {
        name: "Primeiro Carregamento",
        description: "Complete seu primeiro carregamento com sucesso",
        category: "volume",
        icon: "trophy",
        points: 100,
        criteria: { orders_completed: 1 },
        badge_color: "#10B981",
        is_active: true
      },
      {
        name: "Velocista",
        description: "Complete 5 carregamentos em menos de 2 horas cada",
        category: "speed",
        icon: "zap",
        points: 250,
        criteria: { fast_completions: 5, time_limit: 120 },
        badge_color: "#F59E0B",
        is_active: true
      },
      {
        name: "Eficiência Máxima",
        description: "Mantenha 95% de precisão em 10 operações consecutivas",
        category: "efficiency",
        icon: "target",
        points: 300,
        criteria: { accuracy_rate: 95, consecutive_operations: 10 },
        badge_color: "#3B82F6",
        is_active: true
      },
      {
        name: "Especialista em Volume",
        description: "Processe mais de 100 volumes em um único dia",
        category: "volume",
        icon: "package",
        points: 200,
        criteria: { daily_volumes: 100 },
        badge_color: "#8B5CF6",
        is_active: true
      },
      {
        name: "Consistência Exemplar",
        description: "Complete tarefas por 7 dias consecutivos",
        category: "consistency",
        icon: "calendar",
        points: 400,
        criteria: { consecutive_days: 7 },
        badge_color: "#EF4444",
        is_active: true
      },
      {
        name: "Mestre da Qualidade",
        description: "Obtenha 100% de precisão em conferências por 3 dias",
        category: "quality",
        icon: "star",
        points: 350,
        criteria: { perfect_accuracy_days: 3 },
        badge_color: "#F97316",
        is_active: true
      },
      {
        name: "Produtividade Extrema",
        description: "Complete 50 operações em um único turno",
        category: "efficiency",
        icon: "trending-up",
        points: 500,
        criteria: { operations_per_shift: 50 },
        badge_color: "#06B6D4",
        is_active: true
      },
      {
        name: "Zero Erros",
        description: "Complete 25 operações sem nenhum erro",
        category: "quality",
        icon: "check-circle",
        points: 450,
        criteria: { error_free_operations: 25 },
        badge_color: "#84CC16",
        is_active: true
      },
      // Conquistas específicas do FilaX
      {
        name: "Maestro da Fila",
        description: "Mova 50 cartões no FilaX com sucesso",
        category: "filax",
        icon: "shuffle",
        points: 200,
        criteria: { filax_moves: 50 },
        badge_color: "#6366F1",
        is_active: true
      },
      {
        name: "SLA Champion",
        description: "Mantenha 100% de SLA em 20 etapas consecutivas no FilaX",
        category: "filax",
        icon: "target",
        points: 400,
        criteria: { filax_perfect_sla: 20 },
        badge_color: "#10B981",
        is_active: true
      },
      {
        name: "Velocidade da Luz",
        description: "Complete 10 etapas no FilaX em tempo recorde (menos de 5 min cada)",
        category: "filax",
        icon: "zap",
        points: 300,
        criteria: { filax_fast_completions: 10, max_time_minutes: 5 },
        badge_color: "#F59E0B",
        is_active: true
      },
      {
        name: "Organizador Expert",
        description: "Organize e finalize 100 cartões no FilaX",
        category: "filax",
        icon: "check-square",
        points: 500,
        criteria: { filax_completed_cards: 100 },
        badge_color: "#8B5CF6",
        is_active: true
      },
      {
        name: "Multi-Tasker",
        description: "Gerencie cartões com múltiplas ordens vinculadas simultaneamente (5 cartões)",
        category: "filax",
        icon: "layers",
        points: 250,
        criteria: { filax_multi_order_cards: 5 },
        badge_color: "#EF4444",
        is_active: true
      },
      {
        name: "Scanner Pro",
        description: "Use QR Code para buscar 25 ordens no FilaX",
        category: "filax",
        icon: "qr-code",
        points: 150,
        criteria: { filax_qr_scans: 25 },
        badge_color: "#06B6D4",
        is_active: true
      },
      {
        name: "Sem Atrasos",
        description: "Complete um dia inteiro sem nenhum atraso no SLA do FilaX",
        category: "filax",
        icon: "clock",
        points: 350,
        criteria: { filax_no_delays_day: 1 },
        badge_color: "#84CC16",
        is_active: true
      },
      {
        name: "Mestre do Pátio",
        description: "Processe cartões de todos os tipos de operação no FilaX em um único turno",
        category: "filax",
        icon: "truck",
        points: 300,
        criteria: { filax_all_operation_types: true },
        badge_color: "#F97316",
        is_active: true
      }
    ];

    const createdAchievements = [];
    for (const achievement of achievementsData) {
      const created = await storage.createAchievement(achievement);
      createdAchievements.push(created);
      console.log(`✅ Created achievement: ${achievement.name}`);
    }

    // Sample challenges
    const challengesData = [
      {
        name: "Desafio Diário - Eficiência",
        description: "Complete 10 operações com mais de 90% de precisão hoje",
        type: "daily",
        category: "efficiency",
        target_value: 10,
        reward_points: 50,
        start_date: new Date(),
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        is_active: true
      },
      {
        name: "Desafio Semanal - Volume",
        description: "Processe 500 volumes durante esta semana",
        type: "weekly",
        category: "volume",
        target_value: 500,
        reward_points: 200,
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        is_active: true
      },
      {
        name: "Desafio Mensal - Consistência",
        description: "Trabalhe todos os dias úteis deste mês",
        type: "monthly",
        category: "consistency",
        target_value: 20,
        reward_points: 500,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        is_active: true
      },
      // Desafios específicos do FilaX
      {
        name: "Desafio FilaX - Velocidade",
        description: "Mova 15 cartões no FilaX hoje mantendo SLA",
        type: "daily",
        category: "filax",
        target_value: 15,
        reward_points: 75,
        start_date: new Date(),
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        is_active: true
      },
      {
        name: "Desafio FilaX - Precisão",
        description: "Complete 50 etapas no FilaX esta semana sem atrasos no SLA",
        type: "weekly",
        category: "filax",
        target_value: 50,
        reward_points: 250,
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        is_active: true
      },
      {
        name: "Desafio FilaX - Organização",
        description: "Finalize 200 cartões no FilaX este mês",
        type: "monthly",
        category: "filax",
        target_value: 200,
        reward_points: 500,
        start_date: new Date(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        is_active: true
      },
      {
        name: "Desafio Velocidade",
        description: "Complete 3 carregamentos em menos de 90 minutos cada",
        type: "daily",
        category: "speed",
        target_value: 3,
        reward_points: 150,
        start_date: new Date(),
        end_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        is_active: true
      },
      {
        name: "Desafio Qualidade Total",
        description: "Mantenha 100% de precisão por 2 dias consecutivos",
        type: "weekly",
        category: "quality",
        target_value: 2,
        reward_points: 300,
        start_date: new Date(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        is_active: true
      }
    ];

    const createdChallenges = [];
    for (const challenge of challengesData) {
      const created = await storage.createChallenge(challenge);
      createdChallenges.push(created);
      console.log(`✅ Created challenge: ${challenge.name}`);
    }

    // Sample rewards
    const rewardsData = [
      {
        name: "Pausa Estendida",
        description: "15 minutos adicionais de pausa",
        type: "privilege",
        cost_points: 100,
        icon: "coffee",
        is_available: true
      },
      {
        name: "Vaga VIP",
        description: "Vaga de estacionamento reservada por uma semana",
        type: "privilege",
        cost_points: 300,
        icon: "car",
        is_available: true
      },
      {
        name: "Certificado de Excelência",
        description: "Certificado digital de reconhecimento",
        type: "badge",
        cost_points: 500,
        icon: "award",
        is_available: true
      },
      {
        name: "Vale Lanche",
        description: "Vale para lanche na cantina",
        type: "bonus",
        cost_points: 200,
        icon: "gift",
        is_available: true
      },
      {
        name: "Dia de Home Office",
        description: "Um dia de trabalho remoto (quando aplicável)",
        type: "privilege",
        cost_points: 800,
        icon: "home",
        is_available: true
      }
    ];

    const createdRewards = [];
    for (const reward of rewardsData) {
      const created = await storage.createReward(reward);
      createdRewards.push(created);
      console.log(`✅ Created reward: ${reward.name}`);
    }

    console.log('🎮 Gamification data seeding completed successfully!');
    console.log(`📊 Created: ${createdAchievements.length} achievements, ${createdChallenges.length} challenges, ${createdRewards.length} rewards`);

    return {
      achievements: createdAchievements,
      challenges: createdChallenges,
      rewards: createdRewards
    };

  } catch (error) {
    console.error('❌ Error seeding gamification data:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedGamificationData()
    .then(() => {
      console.log('✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}