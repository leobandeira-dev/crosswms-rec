import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Award, Target, Star, TrendingUp, Medal, Zap, Crown, Truck, Layers, QrCode, Clock, CheckSquare, Shuffle } from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  points: number;
  badge_color: string;
  is_active: boolean;
}

interface UserProfile {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  experience_points: number;
  streak_days: number;
  efficiency_score: string;
}

interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: string;
  is_completed: boolean;
}

interface Challenge {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  target_value: number;
  reward_points: number;
  start_date: string;
  end_date: string;
}

interface LeaderboardEntry {
  id: string;
  user_id: string;
  category: string;
  value: string;
  period: string;
  rank: number;
}

const mockUserId = "user-123"; // In real app, get from auth context

export function AchievementDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user profile
  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ['/api/profile', mockUserId],
    enabled: !!mockUserId,
  });

  // Fetch achievements
  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements'],
  });

  // Fetch user achievements
  const { data: userAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ['/api/user-achievements', mockUserId],
    enabled: !!mockUserId,
  });

  // Fetch challenges
  const { data: challenges = [] } = useQuery<Challenge[]>({
    queryKey: ['/api/challenges'],
  });

  // Fetch leaderboard
  const { data: leaderboard = [] } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard', 'points', 'weekly'],
  });

  const getLevelProgress = () => {
    if (!userProfile) return 0;
    const currentLevelXP = userProfile.level * 1000;
    const nextLevelXP = (userProfile.level + 1) * 1000;
    const progress = ((userProfile.experience_points - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'efficiency': return <Zap className="h-4 w-4" />;
      case 'volume': return <TrendingUp className="h-4 w-4" />;
      case 'speed': return <Target className="h-4 w-4" />;
      case 'quality': return <Star className="h-4 w-4" />;
      case 'consistency': return <Medal className="h-4 w-4" />;
      case 'filax': return <Truck className="h-4 w-4 text-indigo-500" />;
      default: return <Award className="h-4 w-4" />;
    }
  };
  
  const getAchievementIcon = (iconName: string) => {
    switch (iconName) {
      case 'shuffle': return <Shuffle className="h-6 w-6" />;
      case 'target': return <Target className="h-6 w-6" />;
      case 'zap': return <Zap className="h-6 w-6" />;
      case 'check-square': return <CheckSquare className="h-6 w-6" />;
      case 'layers': return <Layers className="h-6 w-6" />;
      case 'qr-code': return <QrCode className="h-6 w-6" />;
      case 'clock': return <Clock className="h-6 w-6" />;
      case 'truck': return <Truck className="h-6 w-6" />;
      case 'trophy': return <Trophy className="h-6 w-6" />;
      case 'star': return <Star className="h-6 w-6" />;
      case 'medal': return <Medal className="h-6 w-6" />;
      default: return <Award className="h-6 w-6" />;
    }
  };

  const earnedAchievements = userAchievements.filter(ua => ua.is_completed);
  const inProgressAchievements = userAchievements.filter(ua => !ua.is_completed);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="h-6 w-6 text-yellow-500" />
        <h1 className="text-2xl font-bold">Centro de Conquistas</h1>
      </div>

      {/* User Profile Overview */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Nível {userProfile?.level || 1}</CardTitle>
              <CardDescription className="text-blue-100">
                {userProfile?.total_points || 0} pontos totais
              </CardDescription>
            </div>
            <Crown className="h-12 w-12 text-yellow-300" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progresso para o próximo nível</span>
              <span>{userProfile?.experience_points || 0} XP</span>
            </div>
            <Progress value={getLevelProgress()} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{earnedAchievements.length}</div>
              <div className="text-sm text-blue-100">Conquistas</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{userProfile?.streak_days || 0}</div>
              <div className="text-sm text-blue-100">Dias consecutivos</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{userProfile?.efficiency_score || "0"}%</div>
              <div className="text-sm text-blue-100">Eficiência</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="achievements">Conquistas</TabsTrigger>
          <TabsTrigger value="challenges">Desafios</TabsTrigger>
          <TabsTrigger value="leaderboard">Ranking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Conquistas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {earnedAchievements.slice(0, 3).map((ua) => {
                    const achievement = achievements.find(a => a.id === ua.achievement_id);
                    return achievement ? (
                      <div key={ua.id} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          {getCategoryIcon(achievement.category)}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{achievement.name}</div>
                          <div className="text-xs text-gray-500">+{achievement.points} pontos</div>
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Active Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Desafios Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challenges.slice(0, 3).map((challenge) => (
                    <div key={challenge.id} className="p-2 border rounded-lg">
                      <div className="font-medium text-sm">{challenge.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{challenge.description}</div>
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">{challenge.type}</Badge>
                        <span className="text-xs font-medium">+{challenge.reward_points} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Weekly Ranking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Ranking Semanal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {leaderboard.slice(0, 5).map((entry, index) => (
                    <div key={entry.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.rank}
                        </div>
                        <span className="text-sm">Usuário {entry.user_id.slice(-4)}</span>
                      </div>
                      <span className="text-sm font-medium">{entry.value} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-4">
            {/* Earned Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Conquistas Obtidas ({earnedAchievements.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {earnedAchievements.map((ua) => {
                    const achievement = achievements.find(a => a.id === ua.achievement_id);
                    return achievement ? (
                      <div key={ua.id} className="p-4 border rounded-lg bg-green-50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                            {getCategoryIcon(achievement.category)}
                          </div>
                          <div>
                            <div className="font-medium">{achievement.name}</div>
                            <Badge style={{ backgroundColor: achievement.badge_color }} className="text-white">
                              +{achievement.points} pts
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <div className="text-xs text-gray-500 mt-2">
                          Obtida em {new Date(ua.earned_at).toLocaleDateString()}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Available Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Conquistas Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements
                    .filter(a => !userAchievements.some(ua => ua.achievement_id === a.id))
                    .map((achievement) => (
                      <div key={achievement.id} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                            {getCategoryIcon(achievement.category)}
                          </div>
                          <div>
                            <div className="font-medium">{achievement.name}</div>
                            <Badge variant="outline">+{achievement.points} pts</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                        <Badge variant="secondary" className="mt-2">{achievement.category}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid gap-4">
            {challenges.map((challenge) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{challenge.name}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                    <Badge variant={challenge.type === 'daily' ? 'default' : challenge.type === 'weekly' ? 'secondary' : 'outline'}>
                      {challenge.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Meta</div>
                      <div className="font-medium">{challenge.target_value}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Recompensa</div>
                      <div className="font-medium">+{challenge.reward_points} pontos</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Prazo</div>
                      <div className="font-medium">{new Date(challenge.end_date).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ranking de Pontuação - Esta Semana</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.id} className={`flex items-center justify-between p-4 rounded-lg ${
                    index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-yellow-500 text-white' :
                        index === 1 ? 'bg-gray-400 text-white' :
                        index === 2 ? 'bg-orange-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {entry.rank}
                      </div>
                      <div>
                        <div className="font-medium">Usuário {entry.user_id.slice(-4)}</div>
                        <div className="text-sm text-gray-500">{entry.category}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{entry.value}</div>
                      <div className="text-sm text-gray-500">pontos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}