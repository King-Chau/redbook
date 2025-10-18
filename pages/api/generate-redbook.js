import { GoogleGenerativeAI } from '@google/generative-ai'

// 配置API路由，增加body大小限制
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb', // 设置为10MB限制
        },
    },
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const { images, topic, style } = req.body

        if (!images || images.length === 0) {
            return res.status(400).json({ error: '请至少上传一张图片' })
        }

        // 初始化Gemini AI
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        // 构建提示词
        const basePrompt = `请根据上传的图片生成一篇${style || '生活'}风格的小红书文案${topic ? `，主题是：${topic}` : ''}。

要求：
1. 语言活泼生动，符合小红书用户习惯
2. 包含适当的emoji表情
3. 有吸引人的开头
4. 包含相关话题标签
5. 字数控制在100-300字之间
6. 语气要亲切自然
7. 适合年轻用户群体

请直接返回文案内容，不要包含其他说明文字。`

        // 处理图片数据
        const imageParts = images.map(image => ({
            inlineData: {
                data: image.data.split(',')[1], // 移除data:image/jpeg;base64,前缀
                mimeType: image.mimeType || 'image/jpeg'
            }
        }))

        // 发送请求到Gemini
        const result = await model.generateContent([
            basePrompt,
            ...imageParts
        ])

        const response = await result.response
        const text = response.text()

        return res.status(200).json({ 
            success: true,
            content: text 
        })

    } catch (error) {
        console.error('生成文案失败:', error)
        
        // 如果API调用失败，返回示例文案
        const fallbackContent = `✨ 今天要和大家分享这个超级棒的${req.body.style || '生活'}发现！💖

🌟 真的太喜欢这种感觉了，每次看到都心情特别好～
📸 这组照片的氛围感真的绝了，光影效果超级赞！
💡 分享给大家一些小心得：

1️⃣ 细节很重要，每个角度都值得记录
2️⃣ 色彩搭配要协调，这样出片率更高
3️⃣ 自然光是最好的滤镜

🔥 姐妹们觉得怎么样？快来评论区分享你们的想法吧～

#${req.body.style || '生活'}分享 #生活记录 #每日穿搭 #氛围感 #小红书笔记 #种草 #好物推荐`

        return res.status(200).json({ 
            success: true,
            content: fallbackContent,
            fallback: true
        })
    }
}