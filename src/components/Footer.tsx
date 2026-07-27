import styled from "styled-components";
import fungInstituteLogo from "../assets/Fung Logo Stacked FULL NAME white.png";
import * as palette from "../styles/GlobalStyles";

function Footer() {
  return (
    <FooterWrapper>
      <ParentContainer>
        <Logo src={fungInstituteLogo} />
        <span>
          UC Berkeley | Fung Institute for Engineering Leadership | College of
          Engineering | 2026-27
        </span>
      </ParentContainer>
    </FooterWrapper>
  );
}

const Logo = styled.img`
  max-height: 60px;
`;

const ParentContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  margin: auto;
  padding-bottom: 2rem;
  gap: 30px;
`;

const FooterWrapper = styled.footer`
  width: 100%;
  background-color: ${palette.accent};
  color: #fff;
  text-align: center;
  padding: 1.5rem 2rem;
  font-size: 0.85rem;
`;

export default Footer;
