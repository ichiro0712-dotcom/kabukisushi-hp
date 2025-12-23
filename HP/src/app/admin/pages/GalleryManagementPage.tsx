import { useData } from '../../../contexts/DataContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Upload, Trash2 } from 'lucide-react';

export function GalleryManagementPage() {
  const { galleryImages, deleteImage } = useData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ギャラリー管理</h1>
          <p className="text-gray-600 mt-1">{galleryImages.length}個の画像</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Upload className="w-4 h-4 mr-2" />
          画像をアップロード
        </Button>
      </div>

      {galleryImages.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Upload className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">画像がありません</h3>
            <p className="text-gray-600 mb-4">最初の画像をアップロードしてギャラリーを作成しましょう</p>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Upload className="w-4 h-4 mr-2" />
              画像をアップロード
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map(image => (
            <Card key={image.id} className="border-0 shadow-sm group relative overflow-hidden">
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm('この画像を削除しますか？')) {
                        deleteImage(image.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
