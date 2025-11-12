import wheelIcon from 'src/assets/Icon_Blue.svg';
import wheelIconWhite from 'src/assets/Icon_White.svg';
import '@interface/components/Loading/Loading.scss';

interface InlineLoadingProps {
  message?: string;
  white?: boolean;
}

export default function InlineLoading({
  message = 'Loading...',
  white = false,
}: InlineLoadingProps) {
  return (
    <div className="inline-loading">
      <p>{message}</p>
      <img src={white ? wheelIconWhite : wheelIcon} alt="loading" />
    </div>
  );
}
