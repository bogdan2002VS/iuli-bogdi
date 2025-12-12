import { FileSystemItem, DesktopIcon } from '../types';

export const fileSystem: FileSystemItem[] = [
  {
    id: 'important-txt',
    name: 'IMPORTANT.txt',
    type: 'file',
    icon: '📄',
    path: '/desktop/IMPORTANT.txt',
    content: 'Debangshu loves you :)'
  },
  {
    id: 'pukku-secret',
    name: "pukku's Secret Folder",
    type: 'folder',
    icon: '💕',
    path: '/desktop/strawberry-secret',
    children: [
      {
        id: 'pukku-love-note',
        name: 'i love you:3',
        type: 'file',
        icon: '💌',
        path: '/desktop/pukku-secret/i love Pukku:3',
        content: 'Dear Pukku,\n\nYou mean the world to me! Your smile lights up my day and your laugh is music to my ears.\n\nForever yours,\nStrawberry 💕'
      }
    ]
  },
  {
    id: 'pukku-secret',
    name: "Pukku's Secret Folder",
    type: 'folder',
    icon: '💖',
    path: '/desktop/pinak-secret',
    children: [
      {
        id: 'Debangshu-love-note',
        name: 'i love Pukku:3',
        type: 'file',
        icon: '💌',
        path: '/desktop/pinak-secret/i love pukku:3',
        content: 'My dearest Pukku,\n\nYou are my sunshine, my happiness, and my everything. I fall in love with you more each day. Thank you for being the most amazing person in my life.\n\nWith all my love,\nDebangshu 💖'
      }
    ]
  },
  
  {
    id: 'Pukku-socials',
    name: 'Pukku Socials',
    type: 'folder',
    icon: '🌸',
    path: '/desktop/pukku-socials',
    children: [
      {
        id: 'pukku-discord',
        name: 'Discord - pukku',
        type: 'file',
        icon: 'discord',
        path: '/desktop/pukku-socials/discord',
        content: 'https://discord.com/users/1004860'
      },
      {
        id: 'pukku-telegram',
        name: 'Telegram - pukku',
        type: 'file',
        icon: 'telegram',
        path: '/desktop/strawberry-socialss/telegram',
        content: 'https://web.telegram.org'
      },
      {
        id: 'pukku-spotify',
        name: 'Spotify - pukku',
        type: 'file',
        icon: 'spotify',
        path: '/desktop/strawberry-socials/spotify',
        content: 'https://open.spotify.com/'
      }
    ]
  },
  {
    id: 'Debangshu-socials',
    name: 'Debangshu Socials',
    type: 'folder',
    icon: '🌟',
    path: '/desktop/Debangshu-socials',
    children: [
      {
        id: 'Debangshu-discord',
        name: 'Discord - Debangshu',
        type: 'file',
        icon: 'discord',
        path: '/desktop/Debangshu-socials/discord',
        content: 'https://discord.com/users/1364362'
      },
      {
        id: 'Debangshu-telegram',
        name: 'Telegram - Debangshu',
        type: 'file',
        icon: 'telegram',
        path: '/desktop/Debangshu-socials/telegram',
        content: 'https://web.telegram.org/'
      },
      {
        id: 'Debangshu-twitter',
        name: 'X (Twitter) - Debangshu',
        type: 'file',
        icon: 'twitter',
        path: '/desktop/Debangshu-socials/twitter',
        content: ''
      },
      {
        id: 'Debangshu-github',
        name: 'GitHub - Debangshu',
        type: 'file',
        icon: 'github',
        path: '/desktop/Debangshu-socials/github',
        content: 'https://github.com/Xyz1626'
      },
      {
        id: 'Debangshu-spotify',
        name: 'Spotify - Debangshu',
        type: 'file',
        icon: 'spotify',
        path: '/desktop/Debangshu-socials/spotify',
        content: 'https://open.spotify.com/'
      },
   
    ]
  }
];

export const desktopIcons: DesktopIcon[] = [
  {
    id: 'important-txt',
    name: 'IMPORTANT.txt',
    icon: '📄',
    position: { x: 600, y: 100 }, // Top center area with spacing
    type: 'file',
    action: 'open-file',
    data: { fileId: 'important-txt' }
  },
  {
    id: 'Debangshu-profile', // dont change this path
    name: 'pukku',
    icon: '/media/strawberry.jpg',
    position: { x: 50, y: 50 },
    type: 'app',
    action: 'popup',
    data: { message: 'Happy Girlfriends Day!' }
  },
  {
    id: 'Pukku-socials-folder',
    name: 'Pukku Socials',
    icon: '/media/s-social.jpg',
    position: { x: 50, y: -310 }, // Calculated from bottom - moved higher
    type: 'folder',
    action: 'open-folder',
    data: { folderId: 'Pukku-socials' }
  },
  {
    id: 'Pukku-secret-folder',
    name: "Pukku's Secret Folder",
    icon: '💕',
    position: { x: 50, y: -180 }, // Calculated from bottom - moved higher
    type: 'folder',
    action: 'open-folder',
    data: { folderId: 'Pukku-secret' }
  },
  {
    id: 'Pukku-profile', // Dont change this path
    name: 'pukku',
    icon: '/media/Cat2.jpg',
    position: { x: 180, y: 50 },
    type: 'app',
    action: 'popup',
    data: { message: 'Bubaaa i love you so muchhh' }
  },
  {
    id: 'Debangshu-socials-folder',
    name: 'Debangshu Socials',
    icon: '/media/Cat.jpg',
    position: { x: 180, y: -310 }, // Calculated from bottom - moved higher
    type: 'folder',
    action: 'open-folder',
    data: { folderId: 'Debangshu-socials' }
  },
  {
    id: 'Debangshu-secret-folder',
    name: "Debangshu Secret Folder",
    icon: '💖',
    position: { x: 180, y: -180 }, // Calculated from bottom - moved higher
    type: 'folder',
    action: 'open-folder',
    data: { folderId: 'Debangshu-secret' }
  }
];