export const statusMap = {
    OPEN: 'Aberto',
    IN_PROGRESS: 'Em Progresso',
    WAITING_APPROVAL: 'Aguardando Aprovação',
    COMPLETED: 'Concluído',
    OVERDUE: 'Atrasado'
};

export const priorityMap = {
    LOW: 'Baixa',
    MEDIUM: 'Média',
    HIGH: 'Alta'
};

export const statusColors = {
    OPEN: 'border-l-4 border-blue-500',
    IN_PROGRESS: 'border-l-4 border-yellow-500',
    WAITING_APPROVAL: 'border-l-4 border-purple-500',
    COMPLETED: 'border-l-4 border-green-500',
    OVERDUE: 'border-l-4 border-red-500',
};

export const priorityColors = {
    LOW: 'bg-blue-100 text-blue-800',
    MEDIUM: 'bg-yellow-100 text-yellow-800',
    HIGH: 'bg-red-100 text-red-800',
};
