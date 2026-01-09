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
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const { login, resetCredentials } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/admin/editor';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const isOk = await resetCredentials(recoveryKey, newUsername, newPassword);
      if (isOk) {
        setSuccess('認証情報をリセットしました。新しい情報でログインしてください。');
        setIsResetting(false);
        setRecoveryKey('');
        setNewUsername('');
        setNewPassword('');
      } else {
        setError('リカバリーキーが正しくありません');
      }
    } catch (err) {
      setError('リセットに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg w-full max-w-md mx-auto">
      <CardHeader className="space-y-1 text-center pb-6">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center">
            <span className="text-2xl text-white font-bold">K</span>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold">
          {isResetting ? '認証情報のリセット' : '管理画面'}
        </CardTitle>
        <CardDescription>
          {isResetting ? 'リカバリーキーを使用して再設定します' : 'KABUKI寿司 1番通り店'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isResetting ? (
          <form onSubmit={handleReset} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="recoveryKey">リカバリーキー</Label>
              <Input
                id="recoveryKey"
                type="text"
                placeholder="ソースコードを確認してください"
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newUsername">新しいユーザー名</Label>
              <Input
                id="newUsername"
                type="text"
                placeholder="admin"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新しいパスワード</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? '処理中...' : '再設定する'}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full text-gray-500"
              onClick={() => setIsResetting(false)}
              disabled={isLoading}
            >
              ログインに戻る
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="bg-green-50 text-green-700 border-green-200">
                <AlertDescription>{success}</AlertDescription>
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password">パスワード</Label>
                <Button
                  type="button"
                  variant="link"
                  className="px-0 font-normal text-xs text-purple-600"
                  onClick={() => setIsResetting(true)}
                >
                  パスワードをお忘れですか？
                </Button>
              </div>
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
              className="w-full bg-purple-600 hover:bg-purple-700 font-bold py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>

            <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-gray-100 italic">
              <p>※ デフォルト: admin / kabuki2024</p>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
