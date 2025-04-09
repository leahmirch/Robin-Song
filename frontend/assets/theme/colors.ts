const colors = {
    background: '#F9DFD2',
    text: '#222E50',
    accent: '#ECA08D',
    primary: '#C0483A',
    secondary: '#8485Bf',
    bottomnav: '#FFF8F4',
    card: '#EDD0C0',
    identifycard: '#EDCAB9',
    form: '#FCEFE7',
    placeholder: '#C6877F',
    offwhite: '#FFF8F4',
    chatGPTBackground: '#E7C4B8', 
    chatGPTCardBackground: '#F3E1D6',
    white: '#FFFFFF',
    black: '#000000',
    cardDark: "#3A3A3A",
  } as const;
  
  export type Colors = typeof colors;
  export default colors;
  