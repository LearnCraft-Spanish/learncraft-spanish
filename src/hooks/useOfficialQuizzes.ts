import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import type { Quiz } from "../interfaceDefinitions";
import useAuth from "./useAuth";
import { useBackend } from "./useBackend";

export function useOfficialQuizzes(quizNumber: number | undefined) {
  const { isAuthenticated } = useAuth();
  const { getLcspQuizzesFromBackend, getQuizExamplesFromBackend } =
    useBackend();

  const parseQuizzes = useCallback((quizzes: Quiz[]) => {
    quizzes.forEach((item) => {
      const itemArray = item.quizNickname.split(" ");
      const quizType = itemArray[0];
      item.quizType = quizType;
      if (quizType === "ser-estar") {
        const quizBigNumber = Number.parseInt(itemArray.slice(-1)[0]);
        item.quizNumber = quizBigNumber;
        item.lessonNumber = Number.parseInt(itemArray.slice(-1)[0][0]);
        const quizSubNumber = Number.parseInt(itemArray.slice(-1)[0][2]);
        const getSubtitleFromNumber = (number: number) => {
          switch (number) {
            case 0:
              return "Short Quiz";
            case 1:
              return "Good/Well";
            case 2:
              return "Adjectives";
            case 3:
              return "Prepositions";
            case 4:
              return "Adverbs";
            case 5:
              return "Actions";
            case 6:
              return "Right and Wrong";
            case 7:
              return "Events";
            case 8:
              return "Long Quiz";
            case 9:
              return "Long Quiz (Everything)";
            default:
              return "Quiz";
          }
        };
        const subtitle: string = getSubtitleFromNumber(quizSubNumber);
        item.subtitle = subtitle;
      } else {
        const quizNumber = Number.parseInt(itemArray.slice(-1)[0]);
        item.quizNumber = quizNumber;
      }
    });

    function sortQuizzes(a: Quiz, b: Quiz) {
      const aNumber = a.quizNumber;
      const bNumber = b.quizNumber;
      const aLetter = a.quizLetter;
      const bLetter = b.quizLetter;
      if (aNumber === bNumber) {
        if (aLetter && bLetter) {
          if (aLetter < bLetter) {
            return -1;
          } else {
            return 1;
          }
        } else {
          return 0;
        }
      } else {
        return aNumber - bNumber;
      }
    }
    quizzes.sort(sortQuizzes);
    return quizzes;
  }, []);

  const getAndParseQuizzes = useCallback(async () => {
    const quizzes = await getLcspQuizzesFromBackend();
    return parseQuizzes(quizzes);
  }, [getLcspQuizzesFromBackend, parseQuizzes]);

  const officialQuizzesQuery = useQuery({
    queryKey: ["officialQuizzes"],
    queryFn: getAndParseQuizzes,
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
    enabled: isAuthenticated,
  });

  const quizExamplesQuery = useQuery({
    queryKey: ["quizExamples", quizNumber],
    queryFn: () => getQuizExamplesFromBackend(quizNumber!),
    staleTime: Infinity, // Never stale unless manually updated
    gcTime: Infinity, // Never garbage collect unless manually updated
    enabled: officialQuizzesQuery.isSuccess && !!quizNumber,
  });

  return { officialQuizzesQuery, quizExamplesQuery };
}
