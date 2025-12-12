import { FileSystemItem, DesktopIcon } from '../types';

export const fileSystem: FileSystemItem[] = [
  {
    id: 'important-txt',
    name: 'IMPORTANT.txt',
    type: 'file',
    icon: '📄',
    path: '/desktop/IMPORTANT.txt',
    content: 'Bogdan te iubește :)'
  },
  {
    id: 'iuli-secret',
    name: "Secretele lui Iuli",
    type: 'folder',
    icon: '💕',
    path: '/desktop/iuli-secret',
    children: [
      {
        id: 'iuli-love-note',
        name: 'Te iubesc :3',
        type: 'file',
        icon: '💌',
        path: '/desktop/iuli-secret/te iubesc Iuli:3',
        content: 'Dragă Iuli,\n\nÎnseamni totul pentru mine! Zâmbetul tău îmi luminează ziua și râsul tău este muzică pentru urechile mele.\n\nAl tău pentru totdeauna,\nBobo 💕'
      }
    ]
  },
  {
    id: 'bogdan-secret',
    name: "Secretele lui Bobo",
    type: 'folder',
    icon: '💖',
    path: '/desktop/bogdan-secret',
    children: [
      {
        id: 'bogdan-love-note',
        name: 'Te iubesc Iuliana :3',
        type: 'file',
        icon: '💌',
        path: '/desktop/bogdan-secret/te iubesc iuliana:3',
        content: 'Draga mea Iuliana,\n\nEști soarele meu, fericirea mea și totul pentru mine. Mă îndrăgostesc de tine mai mult în fiecare zi. Îți mulțumesc că ești cea mai minunată persoană din viața mea.\n\nCu toată dragostea mea,\nBogdan 💖'
      }
    ]
  },
  
  {
    id: 'iuliana-socials',
    name: 'Iuliana Socials',
    type: 'folder',
    icon: '🌸',
    path: '/desktop/iuliana-socials',
    children: [
      {
        id: 'iuliana-discord',
        name: 'Discord - Iuli',
        type: 'file',
        icon: 'discord',
        path: '/desktop/iuliana-socials/discord',
        content: 'https://discord.com/users/1004860'
      },
      {
        id: 'iuliana-telegram',
        name: 'Telegram - Iuli',
        type: 'file',
        icon: 'telegram',
        path: '/desktop/iuliana-socials/telegram',
        content: 'https://web.telegram.org'
      },
      {
        id: 'iuliana-spotify',
        name: 'Spotify - Iuli',
        type: 'file',
        icon: 'spotify',
        path: '/desktop/iuliana-socials/spotify',
        content: 'https://open.spotify.com/'
      }
    ]
  },
  {
    id: 'bogdan-socials',
    name: 'Bogdan Socials',
    type: 'folder',
    icon: '🌟',
    path: '/desktop/bogdan-socials',
    children: [
      {
        id: 'bogdan-discord',
        name: 'Discord - Bobo',
        type: 'file',
        icon: 'discord',
        path: '/desktop/bogdan-socials/discord',
        content: 'https://discord.com/users/1364362'
      },
      {
        id: 'bogdan-telegram',
        name: 'Telegram - Bobo',
        type: 'file',
        icon: 'telegram',
        path: '/desktop/bogdan-socials/telegram',
        content: 'https://web.telegram.org/'
      },
      {
        id: 'bogdan-twitter',
        name: 'X (Twitter) - Bobo',
        type: 'file',
        icon: 'twitter',
        path: '/desktop/bogdan-socials/twitter',
        content: ''
      },
      {
        id: 'bogdan-github',
        name: 'GitHub - Bobo',
        type: 'file',
        icon: 'github',
        path: '/desktop/bogdan-socials/github',
        content: 'https://github.com/Xyz1626'
      },
      {
        id: 'bogdan-spotify',
        name: 'Spotify - Bobo',
        type: 'file',
        icon: 'spotify',
        path: '/desktop/bogdan-socials/spotify',
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
    id: 'iuliana-profile',
    name: 'Iuli',
    icon: '/media/strawberry.jpg',
    position: { x: 50, y: 50 },
    type: 'app',
    action: 'popup',
    data: { message: 'Te iubesc mult, Iuli! 💕' }
  },
  {
    id: 'iuliana-socials-folder',
    name: 'Iuliana Socials',
    icon: '/media/s-social.jpg',
    position: { x: 50, y: -310 }, // Calculated from bottom - moved higher
    type: 'folder',
    action: 'open-folder',
    data: { folderId: 'iuliana-socials' }
  },
  {
    id: 'iuliana-secret-folder',
    name: "Secretele lui Iuli",
    icon: '💕',
    position: { x: 50, y: -180 }, // Calculated from bottom - moved higher
    type: 'folder',
    action: 'open-folder',
    data: { folderId: 'iuli-secret' }
  },
  {
    id: 'bogdan-profile',
    name: 'Bobo',
    icon: '/media/Cat2.jpg',
    position: { x: 180, y: 50 },
    type: 'app',
    action: 'popup',
    data: { message: 'Iuli, te iubesc mult mult mult! 💖' }
  },
  {
    id: 'bogdan-socials-folder',
    name: 'Bogdan Socials',
    icon: '/media/Cat.jpg',
    position: { x: 180, y: -310 }, // Calculated from bottom - moved higher
    type: 'folder',
    action: 'open-folder',
    data: { folderId: 'bogdan-socials' }
  },
  {
    id: 'bogdan-secret-folder',
    name: "Secretele lui Bobo",
    icon: '💖',
    position: { x: 180, y: -180 }, // Calculated from bottom - moved higher
    type: 'folder',
    action: 'open-folder',
    data: { folderId: 'bogdan-secret' }
  }
];