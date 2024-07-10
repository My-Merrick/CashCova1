import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-primary p-4"
    >
      <nav className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold"></Link>
        <ul className="flex space-x-4">
          <li>
            <Link to="/trading">Trading</Link>
          </li>

          <li className="text-white">
            <Link to="/wallet">Transactions</Link>
          </li>
        </ul>
      </nav>
    </motion.header>
  );
};

export default Header;
