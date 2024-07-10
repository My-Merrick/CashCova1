import { IconButton } from "@mui/material";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";

const SupportIcon = () => {
  const handleSupportClick = () => {
    window.open("https://t.me/+lHZT-T9eKSVmY2U0", "_blank");
  };

  return (
    <div className="fixed bottom-22 right-4 z-10 bg-gray-400 rounded-full shadow-lg animate-pulse">
      <IconButton
        onClick={handleSupportClick}
        className="bg-blue-500 text-blue rounded-full p-3 shadow-lg hover:bg-blue-600 transition duration-300"
        aria-label="Support"
      >
        <SupportAgentIcon fontSize="large" fontColor="blue" />
      </IconButton>
    </div>
  );
};

export default SupportIcon;
