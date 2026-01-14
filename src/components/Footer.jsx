import React from "react";

function Footer() {
  return (
    <footer className="mt-5 pt-4 border-top border-secondary text-center">
      <p className="text-light opacity-75 small mb-2">
        This work includes material taken from the Daggerheart System Reference
        Document 1.0 by Darrington Press LLC, available at{" "}
        <a
          href="https://daggerheart.com/srd"
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-none"
        >
          daggerheart.com/srd
        </a>
        .
      </p>
      <p className="text-light opacity-75 small mb-2">
        This work is licensed under the{" "}
        <a
          href="https://darringtonpress.com/license"
          target="_blank"
          rel="noopener noreferrer"
          className="text-decoration-none"
        >
          Darrington Press Community Gaming License
        </a>
        .
      </p>
      <p className="text-muted small mb-0">
        Daggerheart is © Darrington Press, LLC
      </p>
    </footer>
  );
}

export default Footer;
