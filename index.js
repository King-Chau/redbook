import Head from 'next/head'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CardHeader, CardContent, Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import imageCompression from 'browser-image-compression'
import { useState, useRef } from 'react'
import { Upload, X, Sparkles, Copy, Download, Heart, MessageCircle, Share2, Image as ImageIcon } from 'lucide-react'

export default function RedBookGenerator() {
    const [images, setImages] = useState([])
    const [compressing, setCompressing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [generatedContent, setGeneratedContent] = useState('')
    const [copySuccess, setCopySuccess] = useState(false)
    const [topic, setTopic] = useState('')
    const [style, setStyle] = useState('时尚')
    const fileInputRef = useRef(null)

    const styles = ['时尚', '美食', '旅行', '生活', '美妆', '健身', '科技', '摄影', '读书', '情感']

    const handleImageUpload = async (files) => {
        setCompressing(true)
        const newImages = []
        
        for (let file of files) {
            if (file.type.startsWith('image/')) {
                try {
                    const compressedFile = await imageCompression(file, {
                        maxSizeMB: 1,
                        maxWidthOrHeight: 1920,
                        useWebWorker: true
                    })
                    
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        newImages.push({
                            id: Date.now() + Math.random(),
                            file: compressedFile,
                            preview: e.target.result,
                            name: file.name
                        })
                        
                        if (newImages.length === files.length) {
                            setImages(prev => [...prev, ...newImages])
                            setCompressing(false)
                        }
                    }
                    reader.readAsDataURL(compressedFile)
                } catch (error) {
                    console.error('压缩图片失败:', error)
                    setCompressing(false)
                }
            }
        }
    }

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files)
        if (files.length > 0) {
            handleImageUpload(files)
        }
    }

    const handleDrop = (e) => {
        e.preventDefault()
        const files = Array.from(e.dataTransfer.files)
        handleImageUpload(files)
    }

    const removeImage = (id) => {
        setImages(images.filter(img => img.id !== id))
    }

    const generateContent = async () => {
        if (images.length === 0) {
            alert('请至少上传一张图片')
            return
        }

        setLoading(true)
        try {
            // 进一步压缩图片数据以避免1MB限制
            const imageData = await Promise.all(images.map(async (img) => {
                // 重新压缩图片到更小的尺寸
                const compressedFile = await imageCompression(img.file, {
                    maxSizeMB: 0.1, // 最大100KB
                    maxWidthOrHeight: 512, // 最大512像素
                    useWebWorker: true,
                    quality: 0.6
                })
                
                return new Promise((resolve) => {
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        resolve({
                            data: e.target.result,
                            mimeType: compressedFile.type
                        })
                    }
                    reader.readAsDataURL(compressedFile)
                })
            }))

            // 验证请求体大小
            const requestBody = JSON.stringify({
                images: imageData,
                topic: topic,
                style: style
            })
            
            const bodySizeInMB = new Blob([requestBody]).size / (1024 * 1024)
            if (bodySizeInMB > 0.9) { // 预留10%空间
                throw new Error('图片数据过大，请减少图片数量或进一步压缩')
            }

            // 调用API生成文案
            const response = await fetch('/api/generate-redbook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            })

            // 检查响应状态
            if (response.status === 413) {
                throw new Error('图片文件过大，请上传更小的图片或减少图片数量')
            }

            if (!response.ok) {
                throw new Error(`请求失败: ${response.status}`)
            }

            const result = await response.json()

            if (result.success) {
                setGeneratedContent(result.content)
                if (result.fallback) {
                    console.log('使用了备用文案生成模式')
                }
            } else {
                throw new Error(result.error || '生成文案失败')
            }

        } catch (error) {
            console.error('生成文案失败:', error)
            let errorMessage = '生成文案失败，请稍后重试'
            
            if (error.message.includes('图片文件过大') || error.message.includes('图片数据过大')) {
                errorMessage = '图片文件过大，请上传更小的图片或减少图片数量'
            } else if (error.message.includes('413')) {
                errorMessage = '请求数据过大，请压缩图片后重试'
            }
            
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedContent)
            setCopySuccess(true)
            setTimeout(() => setCopySuccess(false), 2000)
        } catch (error) {
            console.error('复制失败:', error)
        }
    }

    const downloadContent = () => {
        const element = document.createElement('a')
        const file = new Blob([generatedContent], { type: 'text/plain' })
        element.href = URL.createObjectURL(file)
        element.download = `小红书文案_${new Date().toLocaleDateString()}.txt`
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50">
            <Head>
                <title>小红书文案生成器 - AI智能创作</title>
                <meta name="description" content="智能生成小红书文案，支持多图片上传，一键生成优质内容" />
            </Head>

            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm border-b border-pink-100 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-1.5 rounded-lg">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                                    小红书文案生成器
                                </h1>
                                <p className="text-xs text-gray-600 hidden sm:block">AI智能创作，让你的内容更出彩</p>
                            </div>
                        </div>
                        <div className="items-center gap-2 text-sm text-gray-600 hidden md:flex">
                            <Heart className="w-4 h-4 text-pink-500" />
                            <span>让创作更简单</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-3 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Panel - Upload & Images */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Combined Upload and Preview Area */}
                        <Card className="border-2 border-dashed border-pink-200 bg-white/70 backdrop-blur-sm hover:border-pink-300 transition-colors">
                            <CardContent className="p-4">
                                <div
                                    className="relative"
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    
                                    {images.length === 0 ? (
                                        <div 
                                            className="text-center py-8 cursor-pointer"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <div className="bg-gradient-to-r from-pink-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Upload className="w-8 h-8 text-white" />
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-700 mb-2">
                                                上传你的美图
                                            </h3>
                                            <p className="text-gray-500 mb-4 text-sm">
                                                支持多张图片上传，拖拽或点击选择文件
                                            </p>
                                            <div className="flex justify-center gap-2 text-xs text-gray-400">
                                                <Badge variant="outline" className="px-2 py-1">JPG</Badge>
                                                <Badge variant="outline" className="px-2 py-1">PNG</Badge>
                                                <Badge variant="outline" className="px-2 py-1">WEBP</Badge>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-semibold flex items-center gap-2">
                                                    <ImageIcon className="w-4 h-4 text-pink-500" />
                                                    已上传图片 ({images.length})
                                                </h3>
                                                <Button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    variant="outline"
                                                    size="sm"
                                                    className="flex items-center gap-1 h-8 text-xs"
                                                >
                                                    <Upload className="w-3 h-3" />
                                                    继续添加
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                                                {images.map((image) => (
                                                    <div key={image.id} className="relative group">
                                                        <img
                                                            src={image.preview}
                                                            alt={image.name}
                                                            className="w-full h-20 object-cover rounded border border-pink-100 hover:border-pink-300 transition-colors"
                                                        />
                                                        <button
                                                            onClick={() => removeImage(image.id)}
                                                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {compressing && (
                                    <div className="text-center py-3 border-t border-pink-100 mt-3">
                                        <div className="inline-flex items-center gap-2 text-pink-600 text-sm">
                                            <div className="w-3 h-3 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                                            <span>压缩图片中...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Tag Selection */}
                                <div className="border-t border-pink-100 pt-4 mt-4">
                                    <div className="mb-3">
                                        <Label htmlFor="topic" className="text-sm font-medium">主题/话题 (可选)</Label>
                                        <Input
                                            id="topic"
                                            placeholder="输入你想要的主题，留空则根据图片自动生成"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="mt-1 h-9"
                                        />
                                    </div>
                                    
                                    <div>
                                        <Label className="text-sm font-medium">内容风格</Label>
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {styles.map((s) => (
                                                <button
                                                    key={s}
                                                    onClick={() => setStyle(s)}
                                                    className={`px-2.5 py-1 rounded-full text-xs transition-colors ${
                                                        style === s
                                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Panel - Generate & Result */}
                    <div className="space-y-4">
                        {/* Combined Generate & Result */}
                        <Card className="bg-white/70 backdrop-blur-sm">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-base font-semibold flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-purple-500" />
                                        AI文案生成
                                    </h3>
                                    {generatedContent && (
                                        <div className="flex gap-1">
                                            <Button
                                                onClick={copyToClipboard}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 h-8 text-xs"
                                            >
                                                <Copy className="w-3 h-3" />
                                                {copySuccess ? '已复制!' : '复制'}
                                            </Button>
                                            <Button
                                                onClick={downloadContent}
                                                variant="outline"
                                                size="sm"
                                                className="flex items-center gap-1 h-8 text-xs"
                                            >
                                                <Download className="w-3 h-3" />
                                                下载
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0 space-y-4">
                                {/* Generate Button */}
                                <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg p-4">
                                    <div className="text-center mb-3">
                                        <Sparkles className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-pink-100 text-xs">让AI为你的图片创作精彩文案</p>
                                    </div>
                                    <Button
                                        onClick={generateContent}
                                        disabled={loading || images.length === 0}
                                        className="w-full bg-white text-pink-600 hover:bg-gray-50 font-bold py-3 text-base shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                                                <span>AI创作中...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" />
                                                <span>一键生成文案</span>
                                            </div>
                                        )}
                                    </Button>
                                    {images.length === 0 && (
                                        <p className="text-pink-100 text-xs mt-2 text-center">请先上传图片</p>
                                    )}
                                </div>

                                {/* Result Area */}
                                {generatedContent ? (
                                    <div className="space-y-4">
                                        <Textarea
                                            value={generatedContent}
                                            onChange={(e) => setGeneratedContent(e.target.value)}
                                            className="min-h-[400px] resize-none border-pink-200 focus:border-pink-400"
                                            placeholder="生成的文案将在这里显示..."
                                        />
                                        
                                        {/* Preview */}
                                        <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-lg border border-pink-200">
                                            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                                <Heart className="w-4 h-4 text-pink-500" />
                                                预览效果
                                            </h4>
                                            <div className="bg-white p-4 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
                                                {generatedContent}
                                            </div>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Heart className="w-4 h-4 text-pink-500" />
                                                    <span>1.2k</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MessageCircle className="w-4 h-4 text-blue-500" />
                                                    <span>89</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Share2 className="w-4 h-4 text-green-500" />
                                                    <span>45</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[300px] text-gray-400">
                                        <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                                            <Sparkles className="w-6 h-6" />
                                        </div>
                                        <p className="text-base font-medium">等待你的创作</p>
                                        <p className="text-xs mt-1">上传图片后点击生成，AI将为你创作精彩文案</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tips Section - Bottom */}
                <div className="max-w-7xl mx-auto px-3 py-6">
                    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                        <CardContent className="p-4">
                            <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">💡</span>
                                </div>
                                创作小贴士
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span>图片清晰度越高，生成的文案越精准</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span>可以上传多张图片展现不同角度</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span>选择合适的风格标签能让文案更贴合</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-500 font-bold">•</span>
                                    <span>生成后可以手动编辑文案内容</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}