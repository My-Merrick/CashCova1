import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Facebook,
  Twitter,
  YouTube,
  Instagram,
  Telegram,
} from "@mui/icons-material";
// import FAQ from "./FAQ";

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  //   const footerSections = [
  //     {
  //       title: "About",
  //       links: ["About CashCova", "Contact", "Service"],
  //     },

  //     {
  //       title: "Support",
  //       links: ["Support Center"],
  //     },
  //   ];

  const socialIcons = [
    { Icon: Facebook, link: "#" },
    { Icon: Twitter, link: "#" },

    { Icon: YouTube, link: "#" },
    { Icon: Instagram, link: "#" },
    { Icon: Telegram, link: "https://t.me/cashcova" },
  ];

  return (
    <Box
      component="footer"
      sx={{ bgcolor: "background.paper", py: 6, mt: "auto" }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-between">
          {/* {footerSections.map((section) => (
            <Grid item xs={12} sm={6} md={2} key={section.title}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                {section.title}
              </Typography>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {section.links.map((item) => (
                  <li key={item}>
                    <Link
                      href="#"
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ textDecoration: "none" }}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </Grid>
          ))} */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" color="text.primary" gutterBottom>
              Community
            </Typography>
            <Box sx={{ display: "flex", gap: 1, color: "text.secondary" }}>
              {socialIcons.map(({ Icon, link }) => (
                <IconButton key={link} href={link} color="inherit">
                  <Icon />
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 4, borderColor: "#2a2c2e" }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "center" : "flex-start",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © 2024 CashCova.com
          </Typography>
          <Link to="faq" className="text-blue-400">
            FAQ
          </Link>
          {!isMobile && (
            <Box>
              <Link href="#" color="inherit" sx={{ mr: 2 }}>
                Terms of Service
              </Link>
              <Link href="#" color="inherit">
                Privacy Policy
              </Link>
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
