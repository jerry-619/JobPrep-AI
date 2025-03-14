import { Backdrop, CircularProgress } from '@mui/material';

const Loading = ({ open }) => {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: 9999 }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
};

export default Loading; 