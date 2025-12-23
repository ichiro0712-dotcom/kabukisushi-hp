import { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';
import { Settings } from '../../../types/settings';

export function SettingsPage() {
  const { settings, updateSettings } = useData();
  const [formData, setFormData] = useState<Settings>(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">店舗情報管理</h1>
        <p className="text-gray-600 mt-1">店舗の基本情報を編集できます</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 基本情報 */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>基本情報</CardTitle>
            <CardDescription>店名と連絡先情報</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="storeName">店名</Label>
              <Input
                id="storeName"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">郵便番号</Label>
                <Input
                  id="postalCode"
                  value={formData.address.postalCode}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, postalCode: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">電話番号</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prefecture">都道府県</Label>
              <Input
                id="prefecture"
                value={formData.address.prefecture}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, prefecture: e.target.value }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">市区町村・番地</Label>
              <Input
                id="city"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, city: e.target.value }
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="building">建物名</Label>
              <Input
                id="building"
                value={formData.address.building}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, building: e.target.value }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* 営業情報 */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>営業情報</CardTitle>
            <CardDescription>営業時間と定休日</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="open">開店時刻</Label>
                <Input
                  id="open"
                  type="time"
                  value={formData.businessHours.open}
                  onChange={(e) => setFormData({
                    ...formData,
                    businessHours: { ...formData.businessHours, open: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="close">閉店時刻</Label>
                <Input
                  id="close"
                  type="time"
                  value={formData.businessHours.close}
                  onChange={(e) => setFormData({
                    ...formData,
                    businessHours: { ...formData.businessHours, close: e.target.value }
                  })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SNSリンク */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>SNSリンク</CardTitle>
            <CardDescription>各種SNSのURL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram URL</Label>
              <Input
                id="instagram"
                type="url"
                value={formData.socialMedia.instagram || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialMedia: { ...formData.socialMedia, instagram: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok URL</Label>
              <Input
                id="tiktok"
                type="url"
                value={formData.socialMedia.tiktok || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialMedia: { ...formData.socialMedia, tiktok: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube URL</Label>
              <Input
                id="youtube"
                type="url"
                value={formData.socialMedia.youtube || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialMedia: { ...formData.socialMedia, youtube: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebook">Facebook URL</Label>
              <Input
                id="facebook"
                type="url"
                value={formData.socialMedia.facebook || ''}
                onChange={(e) => setFormData({
                  ...formData,
                  socialMedia: { ...formData.socialMedia, facebook: e.target.value }
                })}
              />
            </div>
          </CardContent>
        </Card>

        {/* 保存ボタン */}
        <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 p-4 z-10">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {saveSuccess && (
              <p className="text-green-600 font-medium">✓ 変更を保存しました</p>
            )}
            <div className="ml-auto">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isSaving ? '保存中...' : '変更を保存'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
