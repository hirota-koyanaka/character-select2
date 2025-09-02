"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useIsTablet } from "@/hooks/use-mobile"

interface Character {
  id: number
  name: string
  class: string
  rarity: "common" | "rare" | "epic" | "legendary"
  image: string
  largeImage: string
  nameImage: string
}

const characters: Character[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: `キャラクター${i + 1}`,
  class: ["戦士", "魔法使い", "弓使い", "僧侶", "盗賊"][i % 5],
  rarity: (["common", "rare", "epic", "legendary"] as const)[i % 4],
  image: `/characters/character${i + 1}.png`,
  largeImage: `/characters/large/character${i + 1}_large.png`,
  nameImage: `/characters/names/character${i + 1}_name.png`,
}))

const rarityColors = {
  common: "bg-gray-50",
  rare: "bg-gray-50",
  epic: "bg-gray-50",
  legendary: "bg-gray-50",
}

export default function CharacterSelect() {
  const router = useRouter()
  const isTablet = useIsTablet()
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(null)
  const [hoveredCharacter, setHoveredCharacter] = useState<number | null>(null)
  const [disabledCharacters, setDisabledCharacters] = useState<Set<number>>(new Set())

  const handleCharacterSelect = (characterId: number) => {
    if (!disabledCharacters.has(characterId)) {
      setSelectedCharacter(characterId)
    }
  }

  // スプレッドシートからデータを取得
  const fetchCharacterStatus = async () => {
    try {
      const response = await fetch('/api/character-status')
      if (response.ok) {
        const data = await response.json()
        const disabled = new Set<number>()
        
        // チェックされているキャラクターをdisabledに追加
        Object.entries(data.status).forEach(([key, value]) => {
          if (value) {
            const id = parseInt(key.replace('character', ''))
            disabled.add(id)
          }
        })
        
        setDisabledCharacters(disabled)
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    }
  }

  useEffect(() => {
    // 初回読み込み
    fetchCharacterStatus()
    
    // ページが表示されている時のみ5秒ごとに更新
    let interval: NodeJS.Timeout | null = null
    
    const startInterval = () => {
      // 既存のインターバルをクリア
      if (interval) clearInterval(interval)
      // 新しいインターバルを開始
      interval = setInterval(fetchCharacterStatus, 5000)
    }
    
    const stopInterval = () => {
      if (interval) {
        clearInterval(interval)
        interval = null
      }
    }
    
    // 可視性の変更を監視
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('ページが非表示になりました - 更新を停止')
        stopInterval()
      } else {
        console.log('ページが表示されました - 更新を再開')
        fetchCharacterStatus() // 表示時に即座に更新
        startInterval()
      }
    }
    
    // 初期状態でページが表示されている場合のみインターバルを開始
    if (!document.hidden) {
      startInterval()
    }
    
    // イベントリスナーを追加
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // クリーンアップ
    return () => {
      stopInterval()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <div className="h-screen overflow-hidden">
      {!selectedCharacter ? (
        <div className={cn(
          "h-full flex flex-col p-1 sm:p-2 lg:p-2",
          isTablet && "overflow-y-auto"
        )}>
          <div className={cn(
            "max-w-7xl mx-auto w-full",
            isTablet ? "py-4" : "h-full flex flex-col justify-center"
          )}>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className={cn(
                    "relative transition-all duration-200",
                    "w-full max-w-[120px] lg:max-w-[140px] mx-auto",
                    disabledCharacters.has(character.id) 
                      ? "cursor-not-allowed" 
                      : "cursor-pointer hover:scale-105"
                  )}
                  onClick={() => handleCharacterSelect(character.id)}
                  onMouseEnter={() => !disabledCharacters.has(character.id) && setHoveredCharacter(character.id)}
                  onMouseLeave={() => setHoveredCharacter(null)}
                >
                  <Card
                    className={cn(
                      "p-0.5 sm:p-1 lg:p-1 border-0",
                      disabledCharacters.has(character.id)
                        ? "bg-gray-100"
                        : "bg-gray-50 hover:shadow-lg",
                      hoveredCharacter === character.id && !disabledCharacters.has(character.id) && "bg-cyan-100",
                    )}
                  >
                    <div className="aspect-square overflow-hidden rounded-md bg-gray-200 relative">
                      <img
                        src={character.image}
                        alt={character.name}
                        className={cn(
                          "w-full h-full object-cover transition-transform duration-200",
                          disabledCharacters.has(character.id)
                            ? "opacity-40"
                            : "hover:scale-110"
                        )}
                        onError={(e) => {
                          e.currentTarget.src = `/api/placeholder/120/120?text=キャラ${character.id}`
                        }}
                      />
                      {
                        // 網掛けオーバーレイ
                        disabledCharacters.has(character.id) && (
                          <div 
                            className="absolute inset-0 pointer-events-none"
                            style={{
                              backgroundImage: `repeating-linear-gradient(
                                45deg,
                                transparent,
                                transparent 10px,
                                rgba(0,0,0,0.3) 10px,
                                rgba(0,0,0,0.3) 20px
                              )`
                            }}
                          />
                        )
                      }
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        isTablet ? (
          // タブレット以下のサイズ: カード形式で表示
          <div className="h-full flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-6">
              <div className="mb-4">
                <img 
                  src="/images/ban_pic_character.png" 
                  alt="BAN/PIC CHARACTER"
                  className="mx-auto h-12 sm:h-14 w-auto"
                />
              </div>

              <Card className="p-6 bg-white shadow-xl">
                <div className="space-y-4">
                  {/* キャラクター画像 */}
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-200 relative max-w-[300px] mx-auto">
                    <img
                      src={characters.find((c) => c.id === selectedCharacter)?.image || ""}
                      alt={characters.find((c) => c.id === selectedCharacter)?.name || ""}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = `/api/placeholder/300/300?text=キャラ${selectedCharacter}`
                      }}
                    />
                  </div>

                  {/* キャラクター名 */}
                  <div className="text-center">
                    <img
                      src={characters.find((c) => c.id === selectedCharacter)?.nameImage || ""}
                      alt={characters.find((c) => c.id === selectedCharacter)?.name || ""}
                      className="max-w-full h-auto inline-block"
                      style={{ maxHeight: '60px' }}
                      onError={(e) => {
                        const characterName = characters.find((c) => c.id === selectedCharacter)?.name || "";
                        e.currentTarget.style.display = 'none';
                        const textElement = document.createElement('h2');
                        textElement.className = 'text-2xl sm:text-3xl font-bold text-foreground';
                        textElement.textContent = characterName;
                        e.currentTarget.parentElement?.appendChild(textElement);
                      }}
                    />
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="px-10 py-3 text-lg text-gray-600 border-gray-300 bg-white hover:text-black hover:border-black hover:bg-gray-100"
                >
                  ←
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // デスクトップサイズ: 重なりレイアウト
          <div className="relative h-screen">
            {/* Left side - Large character image (66%幅) */}
            <div className="absolute inset-y-0 left-0 w-[66%] flex items-center justify-start overflow-hidden">
              <img
                src={characters.find((c) => c.id === selectedCharacter)?.largeImage || ""}
                alt={characters.find((c) => c.id === selectedCharacter)?.name || ""}
                className="h-full w-auto min-h-full object-cover"
                style={{ objectPosition: 'left center' }}
                onError={(e) => {
                  console.error('Failed to load large image:', e.currentTarget.src);
                  // 大きい画像が無い場合は通常の画像を使用
                  const fallbackImage = characters.find((c) => c.id === selectedCharacter)?.image;
                  if (fallbackImage) {
                    e.currentTarget.src = fallbackImage;
                  }
                }}
              />
            </div>

            {/* Right side - Character name and controls (50%幅、前面に配置) */}
            <div className="absolute inset-y-0 right-0 w-[50%] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
              <div className="text-center space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="mb-2 sm:mb-3 lg:mb-4">
                  <img 
                    src="/images/ban_pic_character.png" 
                    alt="BAN/PIC CHARACTER"
                    className="mx-auto h-10 sm:h-12 lg:h-14 w-auto"
                  />
                </div>

                <div className="flex justify-center items-center">
                  <img
                    src={characters.find((c) => c.id === selectedCharacter)?.nameImage || ""}
                    alt={characters.find((c) => c.id === selectedCharacter)?.name || ""}
                    className="max-w-full h-auto"
                    onError={(e) => {
                      const characterName = characters.find((c) => c.id === selectedCharacter)?.name || "";
                      e.currentTarget.style.display = 'none';
                      const textElement = document.createElement('h1');
                      textElement.className = 'text-3xl sm:text-4xl lg:text-6xl font-bold text-foreground';
                      textElement.textContent = characterName;
                      e.currentTarget.parentElement?.appendChild(textElement);
                    }}
                  />
                </div>

                <div className="space-y-4">
                  <Button
                    onClick={() => router.push('/')}
                    variant="outline"
                    className="px-8 sm:px-10 lg:px-12 py-3 sm:py-3.5 lg:py-4 text-lg sm:text-lg lg:text-xl text-gray-600 border-gray-300 bg-white hover:text-black hover:border-black hover:bg-gray-100"
                  >
                    ←
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  )
}
