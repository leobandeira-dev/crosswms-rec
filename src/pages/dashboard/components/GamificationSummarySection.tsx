import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Target, Star, Crown, ArrowRight } from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  total_points: number;
  level: number;
  experience_points: number;
  streak_days: number;
  efficiency_score: string;
}

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

const mockUserId = "user-123"; // In real app, get from auth context

export default function GamificationSummarySection() {
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

  const getLevelProgress = () => {
    if (!userProfile) return 0;
    const currentLevelXP = userProfile.level * 1000;
    const nextLevelXP = (userProfile.level + 1) * 1000;
    const progress = ((userProfile.experience_points - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const earnedAchievements = userAchievements.filter(ua => ua.is_completed);
  const activeChallenges = challenges.filter(c => c.type === 'daily' || c.type === 'weekly').slice(0, 2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
      {/* User Level & Progress */}
      <Card className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Nível {userProfile?.level || 1}</CardTitle>
              <CardDescription className="text-blue-100">
                {userProfile?.total_points || 0} pontos
              </CardDescription>
            </div>
            <Crown className="h-8 w-8 text-yellow-300" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Próximo nível</span>
              <span>{userProfile?.experience_points || 0} XP</span>
            </div>
            <Progress value={getLevelProgress()} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-yellow-500" />
            Conquistas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {earnedAchievements.slice(0, 2).map((ua) => {
              const achievement = achievements.find(a => a.id === ua.achievement_id);
              return achievement ? (
                <div key={ua.id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                  <Award className="h-4 w-4 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{achievement.name}</div>
                    <div className="text-xs text-gray-500">+{achievement.points} pts</div>
                  </div>
                </div>
              ) : null;
            })}
            {earnedAchievements.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-2">
                Nenhuma conquista ainda
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-blue-500" />
            Desafios Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeChallenges.map((challenge) => (
              <div key={challenge.id} className="p-2 border rounded-lg">
                <div className="font-medium text-sm truncate">{challenge.name}</div>
                <div className="flex justify-between items-center mt-1">
                  <Badge variant="outline" className="text-xs">{challenge.type}</Badge>
                  <span className="text-xs font-medium">+{challenge.reward_points} pts</span>
                </div>
              </div>
            ))}
            {activeChallenges.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-2">
                Nenhum desafio ativo
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="h-4 w-4 text-orange-500" />
            Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-lg font-bold">{earnedAchievements.length}</div>
              <div className="text-xs text-gray-500">Conquistas</div>
            </div>
            <div>
              <div className="text-lg font-bold">{userProfile?.streak_days || 0}</div>
              <div className="text-xs text-gray-500">Dias consecutivos</div>
            </div>
            <div className="col-span-2">
              <div className="text-lg font-bold">{userProfile?.efficiency_score || "0"}%</div>
              <div className="text-xs text-gray-500">Eficiência</div>
            </div>
          </div>
          <Link href="/conquistas">
            <Button variant="outline" size="sm" className="w-full mt-3">
              Ver Detalhes
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}