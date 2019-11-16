using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Application.Comments;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR
{
    public class ChatHub : Hub
    {
        private readonly IMediator _mediator;
        public ChatHub(IMediator mediator)
        {
            _mediator = mediator;
        }

        public async Task SendComment(Create.Command command)
        {
            string username = GetUsername();

            command.Username = username;

            var comment = await _mediator.Send(command);

            await Clients.Group(command.ActivityId.ToString()).SendAsync("ReceiveComment", comment);
        }

        private string GetUsername()
        {
            return Context.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.NameIdentifier)?.Value;
        }

        public async Task AddToGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

            var username = GetUsername();

            await Clients.Group(groupName).SendAsync("Send", $"{username} has joined the group");
        }

        public async Task RemoveFromGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

            var username = GetUsername();

            await Clients.Group(groupName).SendAsync("Send", $"{username} has left the group");
        }
    }
}