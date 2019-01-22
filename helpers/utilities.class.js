class Utilities {
    static isMe(messageMember, clientMember) {
        return messageMember.id === clientMember.id;
    }

    static isAdmin(member) {
        return member.hasPermission('ADMINISTRATOR', false, true);
    }
}

module.exports = Utilities;
