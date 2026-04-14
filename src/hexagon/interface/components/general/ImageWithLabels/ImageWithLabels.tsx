import './ImageWithLabels.scss';

export interface ImageWithLabelsProps {
  imageSrc: string;
  imageAlt: string;
  topLabel: string;
  bottomLabel: string;
  topLeftLabel: string;
  bottomLeftLabel: string;
  topRightLabel: string;
  bottomRightLabel: string;
}

export function ImageWithLabels({
  imageSrc,
  imageAlt,
  topLabel,
  bottomLabel,
  topLeftLabel,
  bottomLeftLabel,
  topRightLabel,
  bottomRightLabel,
}: ImageWithLabelsProps) {
  return (
    <div className="imageWithLabels">
      <img src={imageSrc} alt={imageAlt} className="imageWithLabels__image" />
      <span className="imageWithLabels__label imageWithLabels__label--top">
        {topLabel}
      </span>
      <span className="imageWithLabels__label imageWithLabels__label--bottom">
        {bottomLabel}
      </span>
      <span className="imageWithLabels__label imageWithLabels__label--topLeft">
        {topLeftLabel}
      </span>
      <span className="imageWithLabels__label imageWithLabels__label--bottomLeft">
        {bottomLeftLabel}
      </span>
      <span className="imageWithLabels__label imageWithLabels__label--topRight">
        {topRightLabel}
      </span>
      <span className="imageWithLabels__label imageWithLabels__label--bottomRight">
        {bottomRightLabel}
      </span>
    </div>
  );
}
