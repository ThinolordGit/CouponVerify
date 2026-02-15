import React from 'react';
import { useTranslation } from '../context/I18nContext';

function Image({
  src,
  alt = "Image Name",
  className = "",
  ...props
}) {
  const { t } = useTranslation();

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.target.src = "/assets/images/no_image.png"
      }}
      {...props}
    />
  );
}

export default Image;
