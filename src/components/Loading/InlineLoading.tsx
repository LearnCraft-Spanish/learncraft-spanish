import wheelIcon from '../../assets/Icon_Blue.svg';
import './Loading.scss';

interface InlineLoadingProps {
  message?: string;
}

export default function InlineLoading({
  message = 'Loading...',
}: InlineLoadingProps) {
  return (
    <div className="inline-loading">
      <p>{message}</p>
      <img src={wheelIcon} alt="loading" />
    </div>
  );
}
