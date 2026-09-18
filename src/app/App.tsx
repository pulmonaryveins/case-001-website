import { ScrollProvider } from './providers';
import { HeroScene } from '../scenes/HeroScene';
import styles from './App.module.css';
export function App() {
  return (
    <ScrollProvider>
      <main className={styles.shell}>
        <HeroScene />
      </main>
    </ScrollProvider>
  );
}
