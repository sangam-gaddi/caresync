"use client";
import "./TextBlock.css";

import Copy from "./Copy";
import BrandIcon from "./BrandIcon";

const TextBlock = () => {
  return (
    <section className="text-block" id="dataset">
      <div className="container">
        <div className="text-block-col">
          <Copy>
            <h3>Dataset trained, precision engineered.</h3>
          </Copy>
          <div className="text-block-logo">
            <BrandIcon />
          </div>
        </div>
        <div className="text-block-col">
          <div className="text-block-copy">
            <Copy>
              <p className="bodyCopy sm">
                Trained on vast medical datasets with clinical precision. Built on
                evidence, not assumption. Each diagnosis functions with intent,
                nothing more. Neutral in bias, deliberate in accuracy, calibrated
                for optimal patient outcomes.
              </p>
            </Copy>
          </div>
          <div className="text-block-copy">
            <Copy>
              <p className="bodyCopy sm">
                No guesswork. No outdated protocols. Just intelligence engineered
                to persist. Indifferent to noise, untouched by bias. Modular in
                architecture, precise in delivery. A system for those who demand
                accuracy.
              </p>
            </Copy>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TextBlock;
