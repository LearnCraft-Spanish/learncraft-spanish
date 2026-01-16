import type { Course } from 'src/types/CoachingTypes';
import type { EditableCourse, NewCourse } from '../types';
import { Dropdown } from '@interface/components/FormComponents';
import React, { useState } from 'react';
import { FormControls, TextInput } from 'src/components/FormComponents';
import verifyRequiredInputs from 'src/components/FormComponents/functions/inputValidation';
import ContextualView from 'src/hexagon/interface/components/Contextual/ContextualView';
import { useContextualMenu } from 'src/hexagon/interface/hooks/useContextualMenu';
import { useModal } from 'src/hexagon/interface/hooks/useModal';
import useCoursesTable from 'src/hooks/StudentRecordsData/useCoursesTable';
import './EditCourseView.scss';

export default function EditCourseView({
  course,
  onUpdate,
  createMode,
}: {
  course: Course | NewCourse;
  onUpdate: (course: Course | NewCourse) => void;
  createMode?: boolean;
}) {
  const [editObject, setEditObject] = useState<Course | NewCourse>(course);
  const [editMode, setEditMode] = useState(createMode || false);
  const { openModal } = useModal();
  const { closeContextual } = useContextualMenu();

  const captureSubmitForm = () => {
    const requiredInputs = [{ value: editObject.name, label: 'Course Name' }];
    const error = verifyRequiredInputs(requiredInputs);
    if (error) {
      openModal({
        title: 'Error',
        body: `${error} is a required field. Please fill it out before submitting.`,
        type: 'error',
      });
      return;
    }

    // Start with required fields
    const updatedCourse: any = {
      name: editObject.name,
      membershipType: editObject.membershipType,
      approxMonthlyCost: editObject.approxMonthlyCost,
      weeklyPrivateCalls: editObject.weeklyPrivateCalls,
      hasGroupCalls: editObject.hasGroupCalls,
      weeklyTimeCommitmentMinutes: editObject.weeklyTimeCommitmentMinutes,
    };

    // Include recordId for existing courses (when in edit mode)
    if ('recordId' in editObject) {
      updatedCourse.recordId = editObject.recordId;
    }

    onUpdate(updatedCourse as Course | NewCourse);
    setEditMode(false);
  };

  const cancelEdit = () => {
    if (!createMode) {
      setEditMode(false);
    } else {
      closeContextual();
    }
  };

  return (
    <ContextualView
      editFunction={!createMode ? () => setEditMode(!editMode) : undefined}
    >
      <h3>{createMode ? 'Create Course' : 'Edit Course'}</h3>
      <div className="edit-course-form">
        <TextInput
          label="Course Name"
          value={editObject.name}
          onChange={(value) => setEditObject({ ...editObject, name: value })}
          editMode={editMode}
          required
        />
        <TextInput
          label="Membership Type"
          value={editObject.membershipType}
          onChange={(value) =>
            setEditObject({ ...editObject, membershipType: value })
          }
          editMode={editMode}
        />
        <TextInput
          label="Monthly Cost ($)"
          value={editObject.approxMonthlyCost.toString()}
          onChange={(value) =>
            setEditObject({
              ...editObject,
              approxMonthlyCost: Number(value) || 0,
            })
          }
          editMode={editMode}
        />
        <TextInput
          label="Weekly Private Calls"
          value={editObject.weeklyPrivateCalls.toString()}
          onChange={(value) =>
            setEditObject({
              ...editObject,
              weeklyPrivateCalls: Number(value) || 0,
            })
          }
          editMode={editMode}
        />
        <Dropdown
          label="Has Group Calls"
          value={editObject.hasGroupCalls ? 'true' : 'false'}
          onChange={(value) =>
            setEditObject({ ...editObject, hasGroupCalls: value === 'true' })
          }
          options={['true', 'false']}
          editMode={editMode}
        />
        <TextInput
          label="Weekly Time Commitment (minutes)"
          value={editObject.weeklyTimeCommitmentMinutes.toString()}
          onChange={(value) =>
            setEditObject({
              ...editObject,
              weeklyTimeCommitmentMinutes: Number(value) || 0,
            })
          }
          editMode={editMode}
        />
        {editMode && (
          <FormControls
            editMode={editMode}
            cancelEdit={cancelEdit}
            captureSubmitForm={captureSubmitForm}
          />
        )}
      </div>
    </ContextualView>
  );
}

export function EditCourse({ course }: { course: Course }) {
  const { updateCourseMutation } = useCoursesTable();

  function handleUpdate(updatedCourse: Course | NewCourse) {
    if ('recordId' in updatedCourse) {
      updateCourseMutation.mutate(updatedCourse as EditableCourse);
    }
  }

  return <EditCourseView course={course} onUpdate={handleUpdate} />;
}

export function CreateCourse() {
  const { createCourseMutation } = useCoursesTable();

  const handleCreate = (course: NewCourse) => {
    createCourseMutation.mutate(course);
  };

  return (
    <EditCourseView
      course={{
        name: '',
        membershipType: '',
        approxMonthlyCost: 0,
        weeklyPrivateCalls: 0,
        hasGroupCalls: false,
        weeklyTimeCommitmentMinutes: 0,
      }}
      onUpdate={handleCreate}
      createMode
    />
  );
}
