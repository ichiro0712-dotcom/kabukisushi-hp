import { useState } from 'react';
import { useData } from '../../../contexts/DataContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Switch } from '../../components/ui/switch';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { MENU_CATEGORIES } from '../../../utils/constants';
import { MenuCategory } from '../../../types/menu';

export function MenuManagementPage() {
  const { menuItems, toggleSoldOut, deleteMenuItem } = useData();
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | 'all'>('all');

  const filteredItems = selectedCategory === 'all'
    ? menuItems
    : menuItems.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">メニュー管理</h1>
          <p className="text-gray-600 mt-1">{menuItems.length}個のメニューアイテム</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          新しいメニューを追加
        </Button>
      </div>

      {/* カテゴリータブ */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' ? 'bg-purple-600' : ''}
        >
          すべて
        </Button>
        {Object.entries(MENU_CATEGORIES).map(([key, label]) => (
          <Button
            key={key}
            variant={selectedCategory === key ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(key as MenuCategory)}
            className={selectedCategory === key ? 'bg-purple-600' : ''}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* メニューリスト */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => (
          <Card key={item.id} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                  <Badge variant="secondary" className="mt-1">
                    {MENU_CATEGORIES[item.category]}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-purple-600">¥{item.price.toLocaleString()}</p>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
              )}

              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!item.soldOut}
                    onCheckedChange={() => toggleSoldOut(item.id)}
                  />
                  <span className="text-sm text-gray-600">
                    {item.soldOut ? '売り切れ' : '販売中'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`「${item.name}」を削除しますか？`)) {
                        deleteMenuItem(item.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">このカテゴリーにメニューアイテムがありません</p>
        </div>
      )}
    </div>
  );
}
