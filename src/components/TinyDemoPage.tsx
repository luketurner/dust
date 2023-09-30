import { Embedded } from "@/hooks/isEmbedded";
import { View } from "@adobe/react-spectrum";

export default function TinyDemoPage({ children }: { children: React.ReactNode }) {
  return (
    <View marginY={{ base: '-40%', M: '-20%' }}>
      <div style={{ transform: 'scale(0.5, 0.5) rotate(-2deg) skew(2deg)' }} className="border-2 rounded shadow-xl">
        <Embedded>
          {children}
        </Embedded>
      </div>
    </View>
  )
}