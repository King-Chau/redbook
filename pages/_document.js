import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#FF2442" />
        <meta name="description" content="小红书文案生成器 - AI智能创作工具，支持多图片上传，一键生成优质内容" />
        <meta name="keywords" content="小红书,文案生成,AI创作,图片分析,内容创作" />
        <meta name="author" content="RedBook Generator" />
        
        {/* Open Graph */}
        <meta property="og:title" content="小红书文案生成器 - AI智能创作" />
        <meta property="og:description" content="智能生成小红书文案，支持多图片上传，一键生成优质内容" />
        <meta property="og:type" content="website" />
        
        {/* Preload fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}