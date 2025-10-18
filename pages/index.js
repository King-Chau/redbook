import Head from 'next/head'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CardHeader, CardContent, Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import imageCompression from 'browser-image-compression'
import { useState, useRef } from 'react'
import { Upload, X, Sparkles, Copy, Download, Heart, MessageCircle, Share2, Image as ImageIcon, Star, Zap, Camera, Palette } from 'lucide-react'

export default function RedBookGenerator() {
    const [images, setImages] = useState([])
    const [compressing, setCompressing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [generatedContent, setGeneratedContent] = useState('')
    const [copySuccess, setCopySuccess] = useState(false)
    const [topic, setTopic] = useState('')
    const [style, setStyle] = useState('时尚')
    const fileInputRef = useRef(null)

    const styles = [
        { name: '时尚', icon: '👗', color: 'bg-gradient-to-r from-rose-500 to-pink-500' },
        { name: '美食', icon: '🍰', color: 'bg-gradient-to-r from-orange-500 to-red-500' },
        { name: '旅行', icon: '✈️', color: 'bg-gradient-to-r from-blue-500 to-cyan-500' },
        { name: '生活', icon: '🌸', color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
        { name: '美妆', icon: '💄', color: 'bg-gradient-to-r from-purple-500 to-pink-500' },
        { name: '健身', icon: '💪', color: 'bg-gradient-to-r from-green-500 to-emerald-500' },
        { name: '科技', icon: '📱', color: 'bg-gradient-to-r from-gray-600 to-slate-600' },
        { name: '摄影', icon: '📷', color: 'bg-gradient-to-r from-indigo-500 to-purple-500' },
        { name: '读书', icon: '📚', color: 'bg-gradient-to-r from-amber-500 to-yellow-500' },
        { name: '情感', icon: '💕', color: 'bg-gradient-to-r from-red-500 to-pink-500' }
    ]

    const handleImageUpload = async (files) => {
        // 检查图片数量限制
        const remainingSlots = 5 - images.length
        if (remainingSlots <= 0) {
            alert('最多只能上传5张图片')
            return
        }
        
        const filesToProcess = Array.from(files).slice(0, remainingSlots)
        if (files.length > remainingSlots) {
            alert(`只能再上传${remainingSlots}张图片，已为您选择前${remainingSlots}张`)
        }
        
        setCompressing(true)
        const newImages = []
        
        for (let file of filesToProcess) {
            if (file.type.startsWith('image/')) {
                try {
                    const compressedFile = await imageCompression(file, {
                        maxSizeMB: 0.2, // 降低到200KB
                        maxWidthOrHeight: 1024, // 降低分辨率
                        useWebWorker: true,
                        quality: 0.8 // 设置质量为80%
                    })
                    
                    const reader = new FileReader()
                    reader.onload = (e) => {
                        newImages.push({
                            id: Date.now() + Math.random(),
                            file: compressedFile,
                            preview: e.target.result,
                            name: file.name
                        })
                        
                        if (newImages.length === filesToProcess.length) {
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
            const imageData = images.map(img => ({
                data: img.preview,
                mimeType: img.file.type
            }))

            const response = await fetch('/api/generate-redbook', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    images: imageData,
                    topic: topic,
                    style: style
                }),
            })

            // 检查响应状态
            if (!response.ok) {
                if (response.status === 413) {
                    throw new Error('图片文件过大，请压缩图片后重试')
                }
                throw new Error(`服务器错误: ${response.status}`)
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
            
            if (error.message.includes('413') || error.message.includes('过大')) {
                errorMessage = '图片文件过大，请重新上传较小的图片'
            } else if (error.message.includes('网络')) {
                errorMessage = '网络连接失败，请检查网络后重试'
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
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 animate-gradient bg-400%">
            <Head>
                <title>小红书文案生成器 - AI智能创作</title>
                <meta name="description" content="智能生成小红书文案，支持多图片上传，一键生成优质内容" />
                <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>" />
            </Head>

            {/* 装饰背景 */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-xiaohongshu-primary/10 to-xiaohongshu-secondary/10 rounded-full blur-3xl animate-float"></div>
                <div className="absolute top-40 right-20 w-48 h-48 bg-gradient-to-r from-xiaohongshu-secondary/10 to-xiaohongshu-accent/10 rounded-full blur-3xl animate-float" style={{animationDelay: '1s'}}></div>
                <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-gradient-to-r from-xiaohongshu-accent/10 to-xiaohongshu-primary/10 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
            </div>

            {/* Header */}
            <div className="relative bg-white/80 backdrop-blur-lg border-b border-xiaohongshu-primary/10 sticky top-0 z-50 shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="bg-gradient-to-r from-xiaohongshu-primary to-xiaohongshu-secondary p-3 rounded-2xl shadow-lg">
                                    <Sparkles className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-xiaohongshu-accent rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-xiaohongshu-primary via-xiaohongshu-secondary to-xiaohongshu-accent bg-clip-text text-transparent">
                                    小红书文案生成器
                                </h1>
                                <p className="text-gray-600 font-medium">AI智能创作，让你的内容更出彩 ✨</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative max-w-6xl mx-auto px-4 py-8">
                {/* Main Content Area - Single Column with Centered Flow */}
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    {/* Step 1: Upload Area with Image Preview - Compact */}
                    <Card className="border-2 border-dashed border-xiaohongshu-primary/40 bg-white/90 backdrop-blur-sm hover:border-xiaohongshu-primary/60 transition-all duration-300 hover:shadow-xl shadow-lg">
                        <CardContent className="p-6">
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
                                
                                <div 
                                    className={`text-center py-4 cursor-pointer group ${images.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    onClick={() => images.length < 5 && fileInputRef.current?.click()}
                                >
                                    <div className="relative inline-block mb-3">
                                        <div className="bg-gradient-to-r from-xiaohongshu-primary to-xiaohongshu-secondary w-12 h-12 rounded-xl flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-xiaohongshu-accent rounded-full flex items-center justify-center animate-pulse">
                                            <Camera className="w-2 h-2 text-white" />
                                        </div>
                                    </div>
                                    <h2 className="text-lg font-bold text-xiaohongshu-dark mb-2">
                                        📸 上传你的美图 ({images.length}/5)
                                    </h2>
                                    <p className="text-xs text-gray-600 mb-3 leading-relaxed max-w-sm mx-auto">
                                        最多支持5张图片上传，拖拽或点击选择文件<br/>
                                        <span className="font-semibold text-xiaohongshu-primary">AI将智能分析图片内容，生成精彩文案</span>
                                    </p>
                                    <div className="flex justify-center gap-1">
                                        <Badge className="bg-gradient-to-r from-xiaohongshu-primary to-xiaohongshu-secondary text-white border-none px-2 py-0.5 text-xs">JPG</Badge>
                                        <Badge className="bg-gradient-to-r from-xiaohongshu-secondary to-xiaohongshu-accent text-white border-none px-2 py-0.5 text-xs">PNG</Badge>
                                        <Badge className="bg-gradient-to-r from-xiaohongshu-accent to-xiaohongshu-primary text-white border-none px-2 py-0.5 text-xs">WEBP</Badge>
                                    </div>
                                </div>
                            </div>

                            {compressing && (
                                <div className="text-center py-8">
                                    <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-xiaohongshu-light to-white rounded-full border border-xiaohongshu-primary/20 shadow-lg">
                                        <div className="w-6 h-6 border-3 border-xiaohongshu-primary border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xiaohongshu-dark font-bold text-lg">智能压缩图片中...</span>
                                    </div>
                                </div>
                            )}

                            {/* Uploaded Images Preview within Upload Card */}
                            {images.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-xiaohongshu-primary/20">
                                    <h3 className="text-base font-bold flex items-center gap-2 justify-center mb-3">
                                        <div className="bg-gradient-to-r from-xiaohongshu-primary to-xiaohongshu-secondary p-1.5 rounded-lg">
                                            <ImageIcon className="w-4 h-4 text-white" />
                                        </div>
                                        ✅ 已上传的图片
                                    </h3>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 max-w-2xl mx-auto">
                                        {images.map((image) => (
                                            <div key={image.id} className="relative group">
                                                <img
                                                    src={image.preview}
                                                    alt={image.name}
                                                    className="w-full h-20 object-cover rounded-lg border border-xiaohongshu-primary/30 shadow-sm group-hover:shadow-md transition-all duration-300 group-hover:scale-105"
                                                />
                                                <button
                                                    onClick={() => removeImage(image.id)}
                                                    className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 transform shadow-lg"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Step 2: Settings - Compact */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-xiaohongshu-primary/30">
                            <CardHeader className="pb-2">
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <div className="bg-gradient-to-r from-xiaohongshu-secondary to-xiaohongshu-accent p-1.5 rounded-lg">
                                        <Palette className="w-4 h-4 text-white" />
                                    </div>
                                    主题设置
                                </h3>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Label htmlFor="topic" className="text-sm font-bold text-xiaohongshu-dark mb-2 block">💡 主题/话题</Label>
                                <Input
                                    id="topic"
                                    placeholder="输入你想要的主题，留空则根据图片自动生成"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="border-xiaohongshu-primary/40 focus:border-xiaohongshu-primary focus:ring-xiaohongshu-primary/30 bg-white/90 backdrop-blur-sm text-sm py-2"
                                />
                            </CardContent>
                        </Card>

                        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border border-xiaohongshu-primary/30">
                            <CardHeader className="pb-2">
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <div className="bg-gradient-to-r from-xiaohongshu-accent to-xiaohongshu-primary p-1.5 rounded-lg">
                                        <Star className="w-4 h-4 text-white" />
                                    </div>
                                    内容风格
                                </h3>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-5 gap-2">
                                    {styles.map((s) => (
                                        <button
                                            key={s.name}
                                            onClick={() => setStyle(s.name)}
                                            className={`relative overflow-hidden px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 border ${
                                                style === s.name
                                                    ? 'border-xiaohongshu-primary shadow-md scale-105'
                                                    : 'border-gray-200 hover:border-xiaohongshu-primary/50'
                                            }`}
                                        >
                                            <div className={`absolute inset-0 ${style === s.name ? s.color : 'bg-gradient-to-r from-gray-50 to-white'} opacity-${style === s.name ? '100' : '80'}`}></div>
                                            <div className="relative flex items-center gap-1">
                                                <span className="text-sm">{s.icon}</span>
                                                <span className={style === s.name ? 'text-white' : 'text-gray-700'}>{s.name}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Step 3: Generate Button - Super Prominent */}
                    <div className="text-center py-8">
                        <Button
                            onClick={generateContent}
                            disabled={loading || images.length === 0}
                            className="bg-gradient-to-r from-xiaohongshu-primary via-xiaohongshu-secondary to-xiaohongshu-accent hover:shadow-2xl text-white font-bold py-6 px-16 text-2xl rounded-2xl border-none disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-110 transition-all duration-300 shadow-xl"
                        >
                            {loading ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>🎨 AI创作中...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <Sparkles className="w-8 h-8" />
                                    <span>✨ 一键生成精彩文案</span>
                                </div>
                            )}
                        </Button>
                        {images.length === 0 && (
                            <p className="text-gray-500 mt-4 text-lg">请先上传图片再生成文案</p>
                        )}
                    </div>

                    {/* Step 4: Results - Full Width */}
                    {generatedContent && (
                        <Card className="bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-xiaohongshu-primary/30">
                            <CardHeader className="border-b border-xiaohongshu-primary/20">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-2xl font-bold flex items-center gap-4">
                                        <div className="bg-gradient-to-r from-xiaohongshu-accent to-xiaohongshu-primary p-3 rounded-xl">
                                            <Sparkles className="w-6 h-6 text-white animate-pulse" />
                                        </div>
                                        🎉 生成的文案
                                    </h3>
                                    <div className="flex gap-3">
                                        <Button
                                            onClick={copyToClipboard}
                                            variant="outline"
                                            className="flex items-center gap-2 border-xiaohongshu-primary/40 text-xiaohongshu-primary hover:bg-xiaohongshu-primary hover:text-white transition-colors px-6 py-3"
                                        >
                                            <Copy className="w-5 h-5" />
                                            {copySuccess ? '已复制!' : '复制'}
                                        </Button>
                                        <Button
                                            onClick={downloadContent}
                                            variant="outline"
                                            className="flex items-center gap-2 border-xiaohongshu-primary/40 text-xiaohongshu-primary hover:bg-xiaohongshu-primary hover:text-white transition-colors px-6 py-3"
                                        >
                                            <Download className="w-5 h-5" />
                                            下载
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div>
                                        <Label className="text-lg font-bold text-xiaohongshu-dark mb-4 block">📝 编辑文案</Label>
                                        <Textarea
                                            value={generatedContent}
                                            onChange={(e) => setGeneratedContent(e.target.value)}
                                            className="min-h-[350px] resize-none border-xiaohongshu-primary/40 focus:border-xiaohongshu-primary focus:ring-xiaohongshu-primary/30 bg-white/90 backdrop-blur-sm text-base leading-relaxed"
                                            placeholder="生成的文案将在这里显示..."
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-lg font-bold text-xiaohongshu-dark mb-4 block flex items-center gap-2">
                                            <Heart className="w-5 h-5 text-xiaohongshu-primary" />
                                            📱 小红书预览效果
                                        </Label>
                                        <div className="bg-gradient-to-br from-xiaohongshu-light via-white to-xiaohongshu-light/50 p-6 rounded-2xl border-2 border-xiaohongshu-primary/30 shadow-lg min-h-[350px]">
                                            {/* Images in preview */}
                                            {images.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                                        {images.map((image, index) => (
                                                            <img
                                                                key={image.id}
                                                                src={image.preview}
                                                                alt={`预览图${index + 1}`}
                                                                className="w-full h-20 object-cover rounded-lg border border-xiaohongshu-primary/20 shadow-sm"
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="bg-white p-6 rounded-xl text-base whitespace-pre-wrap leading-relaxed shadow-sm border border-xiaohongshu-primary/20 min-h-[270px]">
                                                {generatedContent}
                                            </div>
                                            <div className="flex items-center gap-8 mt-6 text-sm text-gray-600">
                                                <div className="flex items-center gap-2 hover:text-xiaohongshu-primary transition-colors cursor-pointer">
                                                    <Heart className="w-6 h-6 text-xiaohongshu-primary" />
                                                    <span className="font-bold text-base">1.2k</span>
                                                </div>
                                                <div className="flex items-center gap-2 hover:text-blue-500 transition-colors cursor-pointer">
                                                    <MessageCircle className="w-6 h-6" />
                                                    <span className="font-bold text-base">89</span>
                                                </div>
                                                <div className="flex items-center gap-2 hover:text-green-500 transition-colors cursor-pointer">
                                                    <Share2 className="w-6 h-6" />
                                                    <span className="font-bold text-base">45</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {!generatedContent && (
                        <Card className="bg-white/80 backdrop-blur-sm shadow-lg border border-xiaohongshu-primary/20 min-h-[200px]">
                            <CardContent className="flex flex-col items-center justify-center h-full py-16">
                                <div className="relative mb-6">
                                    <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-20 h-20 rounded-2xl flex items-center justify-center">
                                        <Sparkles className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-xiaohongshu-primary to-xiaohongshu-secondary rounded-full flex items-center justify-center">
                                        <Star className="w-3 h-3 text-white" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-gray-600 mb-2">等待你的创作</h3>
                                <p className="text-gray-500 text-center leading-relaxed">
                                    上传图片 → 选择风格 → 点击生成<br/>
                                    AI将为你创作精彩的小红书文案
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}