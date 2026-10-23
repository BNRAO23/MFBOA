import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mutual Fund Back Office Agent (MFBOA) | Ascent L3 BFSI Automation',
  description:
    'L3 Autonomous Mutual Fund Back Office Agent with parallel QA critic, Oracle DB ground truth, Segregation of Duties (SoD), Assistant Manager Ops approval gate, and AMC/Bank feeds.',
  keywords: [
    'Mutual Fund Back Office Agent',
    'MFBOA',
    'BFSI Automation',
    'SEBI Compliance',
    'Parallel QA Critic',
    'AM Approval Gate',
    'AMC Feed',
    'Bank Feed',
    'Ascent Future Proof India'
  ],
  authors: [{ name: 'Bonela Narasinga Rao' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <div className="bg-ambient-layer" />
        {children}
      </body>
    </html>
  );
}
