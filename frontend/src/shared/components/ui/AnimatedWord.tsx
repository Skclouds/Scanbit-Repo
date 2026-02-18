import { useEffect, useState } from "react";

const words = ["Menu", "Catalog", "Products"];

export const AnimatedWord= () => {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    const current = words[wordIndex];

    if (charIndex < current.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + current[charIndex]);
        setCharIndex(charIndex + 1);
      }, 80);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => {
        setText("");
        setCharIndex(0);
        setWordIndex((prev) => (prev + 1) % words.length);
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, wordIndex]);

  return <span className="ml-1">{text}</span>;
};
