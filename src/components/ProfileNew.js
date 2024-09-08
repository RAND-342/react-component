// src/ProfilePage.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { Box, Typography, Avatar, Button, Grid } from '@mui/material';
import { Logout, Delete } from '@mui/icons-material';

const ProfilePage = ({ handleDeleteAccount, handleLogout, admin, profileData: initialProfileData }) => {
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState(initialProfileData);

  const handleEditToggle = () => {
    if (editMode) {
      // Here, you could add a function to save the data to the server if needed
    }
    setEditMode(!editMode);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  return (
    <>
      <MainContent>
      <Grid item>
          <Button variant="contained" color="secondary" onClick={handleEditToggle}>
            {editMode ? "Save" : "Edit"}
          </Button>
        </Grid>
        <ProfileForm>
          {Object.keys(profileData).map((key) => (
            <FormRow key={key}>
              <Label>{key}</Label>
              {editMode ? (
                <Input 
                  type="text" 
                  name={key}
                  value={profileData[key]} 
                  onChange={handleChange} 
                />
              ) : (
                <Text>{profileData[key]}</Text>
              )}
            </FormRow>
          ))}
        </ProfileForm>
      </MainContent>
      <Grid container spacing={2} justifyContent="center">
        {/* <Grid item>
          <Button variant="contained" color="primary" startIcon={<Logout />} onClick={handleLogout}>
            Logout
          </Button>
        </Grid> */}
        <Grid item>
          <Button variant="outlined" color="error" startIcon={<Delete />} onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </Grid>
        
      </Grid>
    </>
  );
};

export default ProfilePage;

const Container = styled.div`
  display: flex;
  height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #2c3e50;
  color: #ecf0f1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
`;

const Logo = styled.div`
  font-size: 1.5em;
  font-weight: bold;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 20px 0;
  width: 100%;
`;

const NavItem = styled.li`
  display: flex;
  align-items: center;
  padding: 15px 20px;
  cursor: pointer;
  color: #ecf0f1;
  &:hover {
    background-color: #34495e;
  }
  & span {
    margin-left: 10px;
  }
`;

const MainContent = styled.div`
  flex-grow: 1;
  background-color: #ecf0f1;
  padding: 20px;
  overflow-y: auto;
`;

const Header = styled.header`
  margin-bottom: 20px;
`;

const ProfileForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: bold;
`;

const Text = styled.div`
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 5px;
  background-color: #ffffff;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #bdc3c7;
  border-radius: 5px;
`;
