// src/utils/teamUtils.js
export const TEAM_INFO = {
  두산: {
    name: '두산 베어스',
    image: '/images/teams/doosan.png',
    color: '#131230',
    bgColor: '#f8f9ff',
  },
  LG: {
    name: 'LG 트윈스',
    image: '/images/teams/lg.png',
    color: '#C4184C',
    bgColor: '#fef7f9',
  },
  삼성: {
    name: '삼성 라이온즈',
    image: '/images/teams/samsung.png',
    color: '#074CA1',
    bgColor: '#f0f7ff',
  },
  KIA: {
    name: '기아 타이거즈',
    image: '/images/teams/kia.png',
    color: '#EA0029',
    bgColor: '#fff5f5',
  },
  롯데: {
    name: '롯데 자이언츠',
    image: '/images/teams/lotte.png',
    color: '#041E42',
    bgColor: '#f5f6f8',
  },
  NC: {
    name: 'NC 다이노스',
    image: '/images/teams/nc.png',
    color: '#315288',
    bgColor: '#f0f4f8',
  },
  한화: {
    name: '한화 이글스',
    image: '/images/teams/hanwha.png',
    color: '#FF6600',
    bgColor: '#fff8f0',
  },
  KT: {
    name: 'KT 위즈',
    image: '/images/teams/kt.png',
    color: '#000000',
    bgColor: '#f8f8f8',
  },
  SSG: {
    name: 'SSG 랜더스',
    image: '/images/teams/ssg.png',
    color: '#CE0E2D',
    bgColor: '#fff5f6',
  },
  키움: {
    name: '키움 히어로즈',
    image: '/images/teams/kiwoom.png',
    color: '#570514',
    bgColor: '#fdf5f6',
  },
}

export const getTeamInfo = teamKey => {
  return (
    TEAM_INFO[teamKey] || {
      name: teamKey,
      image: '/images/teams/default.png',
      color: '#666666',
      bgColor: '#f5f5f5',
    }
  )
}

export const getTeamImage = teamKey => {
  return getTeamInfo(teamKey).image
}

export const getTeamColor = teamKey => {
  return getTeamInfo(teamKey).color
}
