import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

export type NavCard = {
  title: string;
  to: string;
  description: ReactNode;
  /** Short list of what the route covers, shown under the description. */
  items?: string[];
};

/** A responsive grid of route cards for landing and overview pages. */
export default function NavCards({cards}: {cards: NavCard[]}): ReactNode {
  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <Link key={card.to} to={card.to} className={styles.card}>
          <span className={styles.title}>{card.title}</span>
          <span className={styles.description}>{card.description}</span>
          {card.items && (
            <ul className={styles.items}>
              {card.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </Link>
      ))}
    </div>
  );
}
