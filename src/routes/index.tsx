import { Link, createFileRoute } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  const { t } = useTranslation();
  return (
    <section className="mx-auto max-w-2xl space-y-4 p-4">
      <h1 className="text-2xl font-semibold">{t('app.home.title')}</h1>
      <ul>
        <li>
          <Link to="/items">{t('app.nav.items')}</Link>
        </li>
      </ul>
    </section>
  );
}
