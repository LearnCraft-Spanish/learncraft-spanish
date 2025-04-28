import { useFrequensay } from '../../application/units/useFrequensay';

export const FrequensayPage: React.FC = () => {
  const { data, isLoading, error } = useFrequensay();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  console.log(data);
  return (
    <div>
      FrequensayPage
      {data?.map((item) => <div key={item.id}>{item.wordIdiom}</div>)}
    </div>
  );
};
