import { getAudioUrlForExample } from '@application/utils/getAudioUrls';
import { describe, expect, it } from 'vitest';

describe('getAudioUrlForExample', () => {
  it('should return the correct audio urls for an example', () => {
    const result = getAudioUrlForExample(4749);
    expect(result).toEqual({
      english:
        'https://dbexamples.s3.us-east-2.amazonaws.com/dbexamples/ex4749en.mp3',
      spanish:
        'https://dbexamples.s3.us-east-2.amazonaws.com/dbexamples/ex4749la.mp3',
    });
  });
});
