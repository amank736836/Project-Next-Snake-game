import SnakeGame from "@/components/SnakeGame";
import AmbientBackground from "@/components/game/AmbientBackground/AmbientBackground";

export default function Home() {
  return (
    <main>
      <AmbientBackground />
      <SnakeGame />
    </main>
  );
}
