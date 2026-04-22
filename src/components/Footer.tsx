import styled from "styled-components";
import fungInstituteLogo from "../assets/FI_Horizontal_White_transparent.png";

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
  max-height: 65px;
`;

const ParentContainer = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  max-width: 1200px;
  margin: auto;
  gap: 30px;
`;

const FooterWrapper = styled.footer`
  width: 100%;
  background-color: #002676;
  color: #fff;
  text-align: center;
  padding: 1.5rem 2rem;
  font-size: 0.85rem;
`;

export default Footer;
