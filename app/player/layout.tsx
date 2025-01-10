import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Now Playing | Music App',
  description: 'Currently playing track and visualizer',
}

export default function PlayerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 