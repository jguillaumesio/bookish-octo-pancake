import * as React from 'react';
import {AppBar, Box, Toolbar, Container, Button, Link, Breadcrumbs} from '@mui/material';

export const TopBar = ({breadCrumb, links}) => {

    return <AppBar position="static" sx={{ zIndex:2, backgroundColor:"#131313", boxShadow:"none", borderRadius:"20px"}}>
        <Container maxWidth="xl">
            <Toolbar disableGutters>
                <Breadcrumbs separator="-" aria-label="breadcrumb" style={{ color:"grey" }}>
                    {
                        breadCrumb.map((link, index) => <Link key={index} style={{ textDecoration:"none", color:"grey"}}>{link}</Link>)
                    }
                </Breadcrumbs>
                <Box sx={{ flexGrow: 1, display: "flex", textAlign:'right'}}>
                    {links.map((page) => (
                        <Button
                            key={page}
                            onClick={() => {}}
                            sx={{ my: 2, color: 'grey', display: 'block' }}
                        >
                            {page}
                        </Button>
                    ))}
                </Box>
            </Toolbar>
        </Container>
    </AppBar>
}