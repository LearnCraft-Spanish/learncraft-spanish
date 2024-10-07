import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";
import type { VocabTag, Vocabulary } from "../interfaceDefinitions";
import { useBackend } from "./useBackend";
import { useUserData } from "./useUserData";

export function useVocabulary() {
  const userDataQuery = useUserData();
  const { getVocabFromBackend } = useBackend();
  const hasAccess =
    userDataQuery.data?.isAdmin || userDataQuery.data?.role === "student";

  const tagTableRef = useRef<VocabTag[]>([]);

  const nextTagId = useRef(1);

  // Helper function to add tags without duplicates
  const addTag = (
    type: string,
    tag: string,
    vocabDescriptor?: string | undefined,
  ) => {
    if (
      !tagTableRef.current.find(
        (item) =>
          item.type === type &&
          item.tag === tag &&
          (item.vocabDescriptor === vocabDescriptor || !vocabDescriptor),
      )
    ) {
      if (type === "vocabulary") {
        tagTableRef.current.push({
          type,
          tag,
          id: nextTagId.current,
          vocabDescriptor,
        });
      } else {
        tagTableRef.current.push({ type, tag, id: nextTagId.current });
      }
      nextTagId.current++;
    }
  };

  // Helper function to sort vocabulary by frequencyRank, then space-separated words
  const sortVocab = (a: Vocabulary, b: Vocabulary) => {
    if (a.frequencyRank === b.frequencyRank) {
      return a.wordIdiom.includes(" ") === b.wordIdiom.includes(" ")
        ? 0
        : a.wordIdiom.includes(" ")
          ? 1
          : -1;
    }
    return a.frequencyRank - b.frequencyRank;
  };

  // Fetch vocabulary from backend and set up tag table
  const setupVocabTable = async () => {
    try {
      const vocab = await getVocabFromBackend();

      tagTableRef.current = []; // Reset the tag table
      nextTagId.current = 1; // Reset tag ID counter

      vocab?.forEach((term) => {
        if (term.vocabularySubcategorySubcategoryName) {
          addTag("subcategory", term.vocabularySubcategorySubcategoryName);
        }

        if (term.verbInfinitive) {
          addTag("verb", term.verbInfinitive);
        }

        if (term.conjugationTags.length > 0) {
          term.conjugationTags.forEach((conjugation) =>
            addTag("conjugation", conjugation),
          );
        }

        if (term.wordIdiom) {
          const isIdiom = term.vocabularySubcategorySubcategoryName
            ?.toLowerCase()
            .includes("idiom");
          addTag(
            isIdiom ? "idiom" : "vocabulary",
            term.wordIdiom,
            term.descriptionOfVocabularySkill,
          );
        }
      });
      if (!vocab) {
        throw new Error("Failed to fetch vocabulary data");
      }
      return vocab.sort(sortVocab);
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error(e.message);
        throw new Error("Failed to fetch vocabulary");
      } else {
        console.error("An unexpected error occurred:", e);
        throw new Error("Failed to fetch vocabulary");
      }
    }
  };

  const vocabularyQuery = useQuery({
    queryKey: ["vocabulary"],
    queryFn: setupVocabTable,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled: hasAccess,
  });

  const tagTable = tagTableRef.current;

  return { vocabularyQuery, tagTable };
}
