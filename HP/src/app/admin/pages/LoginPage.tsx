import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('ユーザー名またはパスワードが正しくありません');
      }
    } catch (err) {
      setError('ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-3xl text-white font-bold">K</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">管理画面</CardTitle>
        <CardDescription>KABUKI寿司 1番通り店</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">ユーザー名</Label>
            <Input
              id="username"
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700"
            disabled={isLoading}
          >
            {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>

          <div className="text-center text-sm text-gray-500 mt-4">
            <p>デモ用認証情報</p>
            <p>ユーザー名: admin / パスワード: kabuki2024</p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
