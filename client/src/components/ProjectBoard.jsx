/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import { Plus, MoreHorizontal, Folder, Trash2 } from 'lucide-react';
import TaskCard from './TaskCard'; // Assuming I can reuse TaskCard or create a simplified one

const ProjectBoard = ({ tasks, projects, onTaskMove, onProjectCreate, onProjectDelete, fetchTrigger }) => {
    // We need to group tasks by projectId locally for optimistic UI updates
    const [boardData, setBoardData] = useState({
        unassigned: [],
        projects: {} // keyed by projectId
    });

    useEffect(() => {
        // Group tasks
        const newBoardData = {
            unassigned: tasks.filter(t => !t.projectId),
            projects: {}
        };

        projects.forEach(p => {
            newBoardData.projects[p.id] = tasks.filter(t => t.projectId === p.id).sort((a, b) => (a.position || 0) - (b.position || 0));
        });

        setBoardData(newBoardData);
    }, [tasks, projects]);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        // Optimistic Update

        const finishColumnId = destination.droppableId;

        // Logic to update local state... to be implemented carefully or just trigger refetch?
        // Refetch is safer but slower. Optimistic is better UI.
        // Let's call the parent function to handle API and let parent trigger refetch.

        // However, dnd needs immediate state update to not snap back.
        // So I'll do a simple local update?
        // Actually, constructing the new task object for the API:

        const projectId = finishColumnId === 'unassigned' ? null : parseInt(finishColumnId);
        const newPosition = destination.index;

        // Call API
        try {
            await onTaskMove(draggableId, projectId, newPosition);
        } catch (e) {
            console.error("Move failed", e);
            alert('Falha ao mover a tarefa. Atualizando...');
            // Revert? (Trigger refetch)
            fetchTrigger();
        }
    };

    return (
        <div className="flex h-full overflow-x-auto pb-4 gap-4 items-start">
            <DragDropContext onDragEnd={onDragEnd}>

                {/* Unassigned Column */}
                <div className="bg-gray-100 rounded-lg p-2 min-w-[280px] w-[280px] flex flex-col max-h-full">
                    <div className="flex justify-between items-center p-2 mb-2 font-semibold text-gray-700">
                        <div className="flex items-center space-x-2">
                            <Folder size={18} className="text-gray-400" />
                            <span>Sem Projeto</span>
                            <span className="bg-gray-200 text-xs px-2 py-0.5 rounded-full">{boardData.unassigned.length}</span>
                        </div>
                    </div>

                    <Droppable droppableId="unassigned">
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`flex-1 overflow-y-auto min-h-[100px] p-1 space-y-2 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                            >
                                {boardData.unassigned.map((task, index) => (
                                    <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{ ...provided.draggableProps.style }}
                                                className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:shadow-md"
                                            >
                                                <p className="text-sm font-medium text-gray-800">{task.title}</p>
                                                <div className="flex justify-between items-center mt-2">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600`}>
                                                        {task.status}
                                                    </span>
                                                    {task.assignees && task.assignees.length > 0 && (
                                                        <div className="flex -space-x-1">
                                                            {task.assignees.slice(0, 3).map((a, i) => (
                                                                <div key={i} className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center border border-white">
                                                                    {a.user.name.charAt(0)}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </div>

                {/* Project Columns */}
                {projects.map(project => (
                    <div key={project.id} className="bg-gray-50 rounded-lg p-2 min-w-[300px] w-[300px] flex flex-col max-h-full border border-gray-200">
                        <div className="flex justify-between items-center p-2 mb-2">
                            <h3 className="font-bold text-arteb-deepBlue flex items-center space-x-2 truncate">
                                <span>{project.name}</span>
                                <span className="bg-white border text-xs px-2 py-0.5 rounded-full text-gray-500">
                                    {(boardData.projects[project.id] || []).length}
                                </span>
                            </h3>
                            <button onClick={() => onProjectDelete && onProjectDelete(project.id)} className="text-gray-400 hover:text-red-500">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <Droppable droppableId={String(project.id)}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={`flex-1 overflow-y-auto min-h-[100px] p-1 space-y-2 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''}`}
                                >
                                    {(boardData.projects[project.id] || []).map((task, index) => (
                                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{ ...provided.draggableProps.style }}
                                                    className="bg-white p-3 rounded shadow-sm border border-gray-200 hover:shadow-md"
                                                >
                                                    <p className="text-sm font-medium text-gray-800">{task.title}</p>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600`}>
                                                            {task.status}
                                                        </span>
                                                        {task.assignees && task.assignees.length > 0 && (
                                                            <div className="flex -space-x-1">
                                                                {task.assignees.slice(0, 3).map((a, i) => (
                                                                    <div key={i} className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center border border-white">
                                                                        {a.user.name.charAt(0)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}

                {/* New Project Button */}
                <button
                    onClick={onProjectCreate}
                    className="min-w-[280px] h-[50px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors bg-white/50"
                >
                    <Plus size={20} className="mr-2" />
                    Novo Projeto
                </button>

            </DragDropContext>
        </div>
    );
};

export default ProjectBoard;
