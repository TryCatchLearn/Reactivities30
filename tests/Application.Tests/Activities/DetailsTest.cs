using System.Threading;
using System.Threading.Tasks;
using Application.Activities;
using Application.Errors;
using AutoMapper;
using Domain;
using Xunit;

namespace Application.Tests.Activities
{
    public class DetailsTest : TestBase
    {
        private readonly IMapper _mapper;
        
        public DetailsTest()
        {
            var mockMapper = new MapperConfiguration(cfg => { cfg.AddProfile(new MappingProfile()); });
            _mapper = mockMapper.CreateMapper();
        }

        [Fact]
        public void Should_Get_Activity_Details()
        {
            var context = GetDbContext();
            context.Activities.Add(new Activity {Id = 1, Title = "Test Activity 1"});
            context.Activities.Add(new Activity {Id = 2, Title = "Test Activity 2"});
            context.SaveChanges();

            const int id = 1;
            var sut = new Details.Handler(context, _mapper);
            var result = sut.Handle(new Details.Query {Id = id}, CancellationToken.None).Result;
            
            Assert.Equal("Test Activity 1", result.Title);
        }
        
        [Fact]
        public async Task Should_Return_404_If_Activity_Not_Found()
        {
            var context = GetDbContext();

            var sut = new Details.Handler(context, _mapper);
            var result = sut.Handle(new Details.Query {Id = 1}, CancellationToken.None);

            await Assert.ThrowsAsync<RestException>(() => result);
        }
    }
}