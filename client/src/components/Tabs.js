import React, { useState } from 'react';
import 'react-tabs/style/react-tabs.css';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import ChatTab from './ChatTab';
import FileTab from './FileTab';

function Tabs() {
  const [value, setValue] = useState('1');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <Box sx={{ width: '100%', typography: 'body1' }}>
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label="lab API tabs example">
            <Tab label="Chat" value="1" />
            <Tab label="File Manager" value="2" />
          </TabList>
        </Box>
        <TabPanel value="1"><ChatTab /></TabPanel>
        <TabPanel value="2"><FileTab /></TabPanel>
      </TabContext>
    </Box>
  );
}

export default Tabs;
