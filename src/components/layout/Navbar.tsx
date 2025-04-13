import React from 'react';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import GroupIcon from '@mui/icons-material/Group';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

const navLinks = [
  { name: 'Home', href: '/', icon: <HomeIcon /> },
  { name: 'Projects', href: '/projects', icon: <WorkIcon /> },
  { name: 'Freelancers', href: '/freelancers', icon: <GroupIcon /> },
  { name: 'Voting', href: '/voting', icon: <HowToVoteIcon /> },
];

const Navigation = () => {
  return (
    <nav>
      <ul>
        {navLinks.map((link) => (
          <li key={link.name}>
            <Link to={link.href}>
              {link.icon}
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navigation;